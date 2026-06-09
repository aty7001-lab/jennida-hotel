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

  // Credit back the deposit
  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "CANCELLED",
      credit: reservation.deposit,
    },
  });

  // Free the room
  await prisma.room.update({
    where: { id: reservation.roomId },
    data: { status: "AVAILABLE" },
  });

  revalidatePath("/rooms");
  revalidatePath("/bookings");
  revalidatePath("/");
}

export async function getReservations() {
  return prisma.reservation.findMany({
    include: {
      guest: true,
      room: { include: { branch: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
