"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPayment(formData: FormData) {
  const reservationId = formData.get("reservationId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const method = formData.get("method") as "CASH" | "TRANSFER" | "CREDIT_CARD";

  if (!reservationId || !amount || amount <= 0 || !method) {
    return { error: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ" };
  }

  await prisma.payment.create({
    data: {
      reservationId,
      amount,
      method,
      status: "COMPLETED",
    },
  });

  revalidatePath("/payments");
  revalidatePath("/bookings");
  revalidatePath("/reports/revenue");
  revalidatePath("/reports/daily");
  revalidatePath("/");

  return { success: true };
}
