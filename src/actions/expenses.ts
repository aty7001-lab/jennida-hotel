"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExpenses(startDate: string, endDate: string, branchId?: string) {
  const where: Record<string, unknown> = {
    date: {
      gte: new Date(startDate),
      lte: new Date(endDate + "T23:59:59"),
    },
  };
  if (branchId) where.branchId = branchId;

  return prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    include: { branch: { select: { name: true } } },
  });
}

export async function createExpense(formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string || "General";
  const date = formData.get("date") as string;
  const branchId = formData.get("branchId") as string || null;

  if (!description || isNaN(amount) || amount <= 0) return { error: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ" };

  await prisma.expense.create({
    data: {
      description,
      amount,
      category,
      date: date ? new Date(date) : new Date(),
      branchId: branchId || null,
    },
  });

  revalidatePath("/reports/revenue");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/reports/revenue");
}
