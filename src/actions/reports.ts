"use server";

import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, addDays, differenceInDays } from "date-fns";

export async function getDailySummary(dateStr?: string, branchId?: string) {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const whereBranch = branchId ? { room: { branchId } } : {};

  // Arrivals today
  const arrivals = await prisma.reservation.count({
    where: {
      ...whereBranch,
      checkIn: { gte: start, lte: end },
    },
  });

  // Departures today
  const departures = await prisma.reservation.count({
    where: {
      ...whereBranch,
      checkOut: { gte: start, lte: end },
    },
  });

  // In-house guests (Checked In status)
  const inHouse = await prisma.reservation.count({
    where: {
      ...whereBranch,
      status: "CHECKED_IN",
    },
  });

  // Today's Payments (Revenue snapshot)
  const paymentsToday = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "COMPLETED",
      createdAt: { gte: start, lte: end },
      reservation: branchId ? { room: { branchId } } : undefined,
    },
  });

  // Rooms Overview
  const rooms = await prisma.room.findMany({
    where: branchId ? { branchId } : {},
    select: { status: true },
  });

  const roomStatus = {
    total: rooms.length,
    AVAILABLE: rooms.filter((r) => r.status === "AVAILABLE").length,
    OCCUPIED: rooms.filter((r) => r.status === "OCCUPIED").length,
    CLEANING: rooms.filter((r) => r.status === "CLEANING").length,
    MAINTENANCE: rooms.filter((r) => r.status === "MAINTENANCE").length,
  };

  return {
    arrivals,
    departures,
    inHouse,
    todayRevenue: paymentsToday._sum.amount || 0,
    roomStatus,
  };
}

export async function getFinancialReport(startDateStr: string, endDateStr: string, branchId?: string) {
  const start = startOfDay(new Date(startDateStr));
  const end = endOfDay(new Date(endDateStr));
  const days = differenceInDays(end, start) + 1 || 1;

  const whereBranch = branchId ? { room: { branchId } } : {};

  // Actual revenue = COMPLETED payments received in this period
  const paymentsInPeriod = await prisma.payment.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: start, lte: end },
      ...(branchId ? { reservation: { room: { branchId } } } : {}),
    },
    select: {
      method: true,
      amount: true,
      reservation: { select: { source: true } },
    },
  });

  const totalRevenue = paymentsInPeriod.reduce((acc, p) => acc + p.amount, 0);

  // Source breakdown derived from actual payments (not expected totalAmount)
  const sourceBreakdown = paymentsInPeriod.reduce((acc: Record<string, number>, p) => {
    const src = p.reservation.source;
    acc[src] = (acc[src] || 0) + p.amount;
    return acc;
  }, {});

  const paymentMethods = paymentsInPeriod.reduce((acc: Record<string, number>, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount;
    return acc;
  }, {});

  // Refunds issued in this period (cancellations, early checkouts)
  const refundsInPeriod = await prisma.payment.findMany({
    where: {
      status: "REFUNDED",
      createdAt: { gte: start, lte: end },
      ...(branchId ? { reservation: { room: { branchId } } } : {}),
    },
    select: { amount: true },
  });
  const totalRefunds = refundsInPeriod.reduce((acc, p) => acc + p.amount, 0);
  const netRevenue = totalRevenue - totalRefunds;

  // All reservations with at least one COMPLETED payment in this period
  // Include CANCELLED so drilldown = revenue (fully auditable)
  const reservations = await prisma.reservation.findMany({
    where: {
      ...whereBranch,
      payments: {
        some: {
          status: "COMPLETED",
          createdAt: { gte: start, lte: end },
        },
      },
    },
    include: {
      payments: { where: { status: "COMPLETED" }, select: { amount: true } },
      guest: { select: { name: true } },
      room: { select: { number: true, type: true } },
    },
    orderBy: { checkIn: "desc" },
  });

  const totalBookings = reservations.length;
  const ADR = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const totalRooms = await prisma.room.count({ where: branchId ? { branchId } : {} });
  const totalAvailableRooms = totalRooms * days;
  const RevPAR = totalAvailableRooms > 0 ? totalRevenue / totalAvailableRooms : 0;

  const bookingDetails = reservations.map((r) => {
    const paidAmount = r.payments.reduce((s, p) => s + p.amount, 0);
    return {
      id: r.id,
      guestName: r.guest.name,
      roomNumber: r.room.number,
      roomType: r.room.type,
      checkIn: r.checkIn.toISOString(),
      checkOut: r.checkOut.toISOString(),
      source: r.source,
      status: r.status,
      totalAmount: r.totalAmount,
      paidAmount,
      balance: Math.max(0, r.totalAmount - paidAmount),
      discountNote: r.discountNote ?? null,
    };
  });

  return {
    totalRevenue,
    totalRefunds,
    netRevenue,
    ADR,
    RevPAR,
    sourceBreakdown,
    paymentMethods,
    totalBookings,
    bookingDetails,
  };
}

export async function getOccupancyReport(startDateStr: string, endDateStr: string, branchId?: string) {
  const start = startOfDay(new Date(startDateStr));
  const end = endOfDay(new Date(endDateStr));
  const days = differenceInDays(end, start) + 1 || 1;

  const whereBranch = branchId ? { room: { branchId } } : {};

  // Bookings active during this period (checkIn <= end AND checkOut >= start)
  const activeBookings = await prisma.reservation.findMany({
    where: {
      ...whereBranch,
      status: { not: "CANCELLED" },
      checkIn: { lte: end },
      checkOut: { gte: start },
    },
    include: { room: true },
  });

  const totalRooms = await prisma.room.count({ where: branchId ? { branchId } : {} });
  const totalRoomNightsAvailable = totalRooms * days;

  // Calculate occupied nights within this period
  let occupiedNights = 0;
  activeBookings.forEach((b) => {
    const bookingStart = b.checkIn < start ? start : b.checkIn;
    const bookingEnd = b.checkOut > end ? end : b.checkOut;
    const nights = differenceInDays(bookingEnd, bookingStart) || 1; // Minimum 1 night
    occupiedNights += nights;
  });

  const occupancyRate = totalRoomNightsAvailable > 0 ? (occupiedNights / totalRoomNightsAvailable) * 100 : 0;

  // Average Length of Stay
  const totalStays = activeBookings.reduce((acc, b) => {
    return acc + (differenceInDays(b.checkOut, b.checkIn) || 1);
  }, 0);
  const ALOS = activeBookings.length > 0 ? totalStays / activeBookings.length : 0;

  // Room Type Popularity
  const roomTypes = activeBookings.reduce((acc: any, b) => {
    acc[b.room.type] = (acc[b.room.type] || 0) + 1;
    return acc;
  }, {});

  return {
    occupancyRate,
    occupiedNights,
    totalRoomNightsAvailable,
    ALOS,
    roomTypes,
  };
}

export async function getPayments(branchId?: string, startDate?: string, endDate?: string) {
  return await prisma.payment.findMany({
    where: {
      ...(branchId ? { reservation: { room: { branchId } } } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate + "T23:59:59.999Z") } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      reservation: {
        include: {
          guest: true,
          room: true,
        },
      },
    },
  });
}
