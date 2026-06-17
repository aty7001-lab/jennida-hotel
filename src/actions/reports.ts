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

  // Get all reservations in period
  const reservations = await prisma.reservation.findMany({
    where: {
      ...whereBranch,
      createdAt: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    include: { payments: true },
  });

  const totalRevenue = reservations.reduce((acc, r) => acc + r.totalAmount, 0);
  const ADR = reservations.length > 0 ? totalRevenue / reservations.length : 0; // Simplified ADR

  // RevPAR = Total Room Revenue / Total Available Rooms
  const totalRooms = await prisma.room.count({ where: branchId ? { branchId } : {} });
  const totalAvailableRooms = totalRooms * days;
  const RevPAR = totalAvailableRooms > 0 ? totalRevenue / totalAvailableRooms : 0;

  // Breakdown by Source
  const sourceBreakdown = reservations.reduce((acc: any, r) => {
    acc[r.source] = (acc[r.source] || 0) + r.totalAmount;
    return acc;
  }, {});

  // Get all payments in period for method breakdown
  const payments = await prisma.payment.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: start, lte: end },
      reservation: branchId ? { room: { branchId } } : undefined,
    },
  });

  const paymentMethods = payments.reduce((acc: any, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount;
    return acc;
  }, {});

  return {
    totalRevenue,
    ADR,
    RevPAR,
    sourceBreakdown,
    paymentMethods,
    totalBookings: reservations.length,
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

export async function getPayments(branchId?: string) {
  return await prisma.payment.findMany({
    where: branchId ? { reservation: { room: { branchId } } } : undefined,
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
