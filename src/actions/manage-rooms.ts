"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createRoom(formData: FormData) {
  const number = formData.get("number") as string;
  const type = formData.get("type") as string;
  const price = parseFloat(formData.get("price") as string);
  const branchId = formData.get("branchId") as string;

  if (!number || !type || !price || !branchId) {
    throw new Error("Missing required fields");
  }

  await prisma.room.create({
    data: { number, type, price, branchId },
  });

  revalidatePath("/rooms");
  redirect("/rooms");
}

export async function deleteRoom(id: string) {
  await prisma.room.delete({
    where: { id },
  });

  revalidatePath("/rooms");
  redirect("/rooms");
}

export async function updateRoom(id: string, formData: FormData) {
  const number = formData.get("number") as string;
  const type = formData.get("type") as string;
  const price = parseFloat(formData.get("price") as string);
  const branchId = formData.get("branchId") as string;

  if (!number || !type || !price || !branchId) {
    throw new Error("Missing required fields");
  }

  await prisma.room.update({
    where: { id },
    data: { number, type, price, branchId },
  });

  revalidatePath("/rooms");
  redirect("/rooms");
}

export async function markRoomAsClean(id: string) {
  await prisma.room.update({
    where: { id },
    data: { status: "AVAILABLE" },
  });
  revalidatePath("/rooms");
}
