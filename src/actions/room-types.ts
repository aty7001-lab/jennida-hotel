"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getRoomTypes(branchId?: string) {
  return prisma.roomType.findMany({
    where: branchId ? { branchId } : undefined,
    include: { _count: { select: { rooms: true } } },
    orderBy: [{ branchId: "asc" }, { name: "asc" }],
  });
}

export async function getRoomTypesByBranch(branchId: string) {
  return prisma.roomType.findMany({
    where: { branchId },
    orderBy: { name: "asc" },
  });
}

export async function getRoomTypeById(id: string) {
  return prisma.roomType.findUnique({
    where: { id },
    include: { branch: true, _count: { select: { rooms: true } } },
  });
}

export async function createRoomType(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const branchId = formData.get("branchId") as string;

  if (!name || !branchId) throw new Error("ກະລຸນາປ້ອນຊື່ປະເພດ ແລະ ສາຂາ");

  const existing = await prisma.roomType.findFirst({ where: { name, branchId } });
  if (existing) throw new Error("ປະເພດຫ້ອງນີ້ມີຢູ່ແລ້ວໃນສາຂານີ້");

  await prisma.roomType.create({ data: { name, branchId } });

  revalidatePath("/room-types");
  redirect("/room-types");
}

export async function updateRoomType(id: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();

  if (!name) throw new Error("ກະລຸນາປ້ອນຊື່ປະເພດ");

  const current = await prisma.roomType.findUnique({ where: { id } });
  if (!current) throw new Error("ບໍ່ພົບປະເພດຫ້ອງ");

  const conflict = await prisma.roomType.findFirst({
    where: { name, branchId: current.branchId, id: { not: id } },
  });
  if (conflict) throw new Error("ປະເພດຫ້ອງຊື່ນີ້ມີຢູ່ແລ້ວໃນສາຂານີ້");

  await prisma.roomType.update({ where: { id }, data: { name } });

  revalidatePath("/room-types");
  redirect("/room-types");
}

export async function deleteRoomType(id: string) {
  const roomType = await prisma.roomType.findUnique({
    where: { id },
    include: { _count: { select: { rooms: true } } },
  });
  if (!roomType) throw new Error("ບໍ່ພົບປະເພດຫ້ອງ");
  if (roomType._count.rooms > 0) {
    throw new Error(`ບໍ່ສາມາດລຶບໄດ້ — ມີ ${roomType._count.rooms} ຫ້ອງໃຊ້ປະເພດນີ້ຢູ່`);
  }

  await prisma.roomType.delete({ where: { id } });
  revalidatePath("/room-types");
}
