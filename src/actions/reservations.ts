"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { differenceInDays } from "date-fns";

function revalidateAll() {
  revalidatePath("/rooms");
  revalidatePath("/bookings");
  revalidatePath("/");
}

export async function checkInReservation(reservationId: string) {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CHECKED_IN" },
  });
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (reservation) {
    await prisma.room.update({ where: { id: reservation.roomId }, data: { status: "OCCUPIED" } });
  }
  revalidateAll();
}

export async function checkOutReservation(reservationId: string) {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CHECKED_OUT" },
  });
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (reservation) {
    await prisma.room.update({ where: { id: reservation.roomId }, data: { status: "CLEANING" } });
  }
  revalidateAll();
}

export async function cancelReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { payments: true },
  });
  if (!reservation) throw new Error("ບໍ່ພົບການຈອງ");

  const credit = reservation.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED", credit },
  });

  await prisma.room.update({
    where: { id: reservation.roomId },
    data: { status: reservation.status === "CHECKED_IN" ? "CLEANING" : "AVAILABLE" },
  });

  revalidateAll();
}

export async function moveRoomReservation(reservationId: string, newRoomId: string) {
  await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) throw new Error("ບໍ່ພົບການຈອງ");

    await tx.room.update({ where: { id: reservation.roomId }, data: { status: "CLEANING" } });
    await tx.room.update({ where: { id: newRoomId }, data: { status: "OCCUPIED" } });
    await tx.reservation.update({ where: { id: reservationId }, data: { roomId: newRoomId } });
  });
  revalidateAll();
}

export async function extendStay(reservationId: string, newCheckOut: string) {
  const checkOut = new Date(newCheckOut);
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { room: true },
  });
  if (!reservation) throw new Error("ບໍ່ພົບການຈອງ");
  if (reservation.status !== "CHECKED_IN") throw new Error("ສາມາດຕໍ່ໄດ້ສະເພາະທ່ານທີ່ເຊັກອິນຢູ່");
  if (checkOut <= reservation.checkOut) throw new Error("ວັນເຊັກເອົ້າໃໝ່ຕ້ອງຫຼັງວັນເຊັກເອົ້າເດີມ");

  const oldNights = differenceInDays(reservation.checkOut, reservation.checkIn);
  const newNights = differenceInDays(checkOut, reservation.checkIn);
  const priceDelta = reservation.room.price * (newNights - oldNights);

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { checkOut, totalAmount: reservation.totalAmount + priceDelta },
  });

  revalidateAll();
}

export async function earlyCheckout(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { room: true, payments: true },
  });
  if (!reservation) throw new Error("ບໍ່ພົບການຈອງ");
  if (reservation.status !== "CHECKED_IN") throw new Error("ສາມາດໃຊ້ໄດ້ສະເພາະທ່ານທີ່ເຊັກອິນຢູ່");

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const actualNights = Math.max(1, differenceInDays(today, reservation.checkIn));
  const originalNights = differenceInDays(reservation.checkOut, reservation.checkIn);

  const alreadyPaid = reservation.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + p.amount, 0);

  const priceDelta = reservation.room.price * (actualNights - originalNights);
  const newTotal = Math.max(alreadyPaid, reservation.totalAmount + priceDelta);
  const credit = alreadyPaid > newTotal ? alreadyPaid - newTotal : 0;

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: { checkOut: today, totalAmount: newTotal, credit, status: "CHECKED_OUT" },
    });
    await tx.room.update({ where: { id: reservation.roomId }, data: { status: "CLEANING" } });
  });

  revalidateAll();
}

export async function changeDates(reservationId: string, newCheckIn: string, newCheckOut: string) {
  const checkIn = new Date(newCheckIn);
  const checkOut = new Date(newCheckOut);
  const nights = differenceInDays(checkOut, checkIn);
  if (nights <= 0) throw new Error("ວັນເຊັກເອົ້າຕ້ອງຫຼັງວັນເຊັກອິນ");

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { room: true },
  });
  if (!reservation) throw new Error("ບໍ່ພົບການຈອງ");
  if (!["PENDING", "CONFIRMED"].includes(reservation.status)) throw new Error("ສາມາດດັດແກ້ໄດ້ສະເພາະການຈອງທີ່ຍັງບໍ່ໄດ້ເຊັກອິນ");

  const conflict = await prisma.reservation.findFirst({
    where: {
      roomId: reservation.roomId,
      id: { not: reservationId },
      status: { notIn: ["CANCELLED", "CHECKED_OUT"] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
  if (conflict) throw new Error("ຫ້ອງຖືກຈອງໃນຊ່ວງວັນດັ່ງກ່າວແລ້ວ");

  const oldNights = differenceInDays(reservation.checkOut, reservation.checkIn);
  const priceDelta = reservation.room.price * (nights - oldNights);

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { checkIn, checkOut, totalAmount: reservation.totalAmount + priceDelta },
  });

  revalidateAll();
}

export async function addExtraCharge(reservationId: string, amount: number, note: string) {
  if (amount <= 0) throw new Error("ຈຳນວນຕ້ອງຫຼາຍກວ່າ 0");
  if (!note.trim()) throw new Error("ກະລຸນາລະບຸລາຍການ");

  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new Error("ບໍ່ພົບການຈອງ");
  if (reservation.status !== "CHECKED_IN") throw new Error("ສາມາດໃຊ້ໄດ້ສະເພາະທ່ານທີ່ເຊັກອິນຢູ່");

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { totalAmount: reservation.totalAmount + amount },
  });

  revalidateAll();
}

export async function applyDiscount(reservationId: string, discountAmount: number, reason: string) {
  if (discountAmount <= 0) throw new Error("ຈຳນວນສ່ວນລົດຕ້ອງຫຼາຍກວ່າ 0");
  if (!reason.trim()) throw new Error("ກະລຸນາລະບຸເຫດຜົນ");

  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new Error("ບໍ່ພົບການຈອງ");
  if (discountAmount > reservation.totalAmount) throw new Error("ຈຳນວນສ່ວນລົດຫຼາຍກວ່າຍອດລວມ");

  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      totalAmount: reservation.totalAmount - discountAmount,
      discountNote: reason,
    },
  });

  revalidateAll();
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
      payments: { orderBy: { createdAt: "desc" } },
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
