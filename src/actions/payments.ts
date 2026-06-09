"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPayment(formData: FormData) {
  const reservationId = formData.get("reservationId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const method = formData.get("method") as any;

  if (!reservationId || !amount || !method) {
    throw new Error("Missing required fields");
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
  revalidatePath("/");

  redirect("/payments");
}
