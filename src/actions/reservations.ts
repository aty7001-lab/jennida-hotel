"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function checkInReservation(reservationId: string) {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CHECKED_IN" },
  });

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (reservation) {
    await prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: "OCCUPIED" },
    });
  }

  revalidatePath("/rooms");
  revalidatePath("/bookings");
  revalidatePath("/");
}

export async function checkOutReservation(reservationId: string) {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CHECKED_OUT" },
  });

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (reservation) {
    await prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: "CLEANING" },
    });
  }

  revalidatePath("/rooms");
  revalidatePath("/bookings");
  revalidatePath("/");
}

export async function cancelReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation) throw new Error("Reservation not found");

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED", credit: reservation.deposit },
  });

  // If was checked in → CLEANING, otherwise AVAILABLE
  await prisma.room.update({
    where: { id: reservation.roomId },
    data: { status: reservation.status === "CHECKED_IN" ? "CLEANING" : "AVAILABLE" },
  });

  revalidatePath("/rooms");
  revalidatePath("/bookings");
  revalidatePath("/");
}

export async function moveRoomReservation(reservationId: string, newRoomId: string) {
  await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) throw new Error("Reservation not found");

    // Old room → CLEANING (guest just vacated it)
    await tx.room.update({
      where: { id: reservation.roomId },
      data: { status: "CLEANING" },
    });

    // New room → OCCUPIED
    await tx.room.update({
      where: { id: newRoomId },
      data: { status: "OCCUPIED" },
    });

    await tx.reservation.update({
      where: { id: reservationId },
      data: { roomId: newRoomId },
    });
  });

  revalidatePath("/rooms");
  revalidatePath("/bookings");
  revalidatePath("/");
}

export async function getReservations(branchId?: string) {
  return prisma.reservation.findMany({
    where: branchId ? { room: { branchId } } : undefined,
    include: {
      guest: true,
      room: { include: { branch: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReservationById(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      guest: true,
      room: { include: { branch: true } },
      payments: true,
    },
  });
}

export async function getReservationsByIds(ids: string[]) {
  return prisma.reservation.findMany({
    where: { id: { in: ids } },
    include: {
      guest: true,
      room: { include: { branch: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
