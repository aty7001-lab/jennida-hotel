"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAllBranches() {
  try {
    return await prisma.branch.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

export async function getBranchById(id: string) {
  return prisma.branch.findUnique({
    where: { id },
    include: {
      _count: { select: { rooms: true, users: true } },
    },
  });
}

export async function createBranch(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const address = (formData.get("address") as string)?.trim() || null;

  if (!name || !code) throw new Error("Name and code are required");

  await prisma.branch.create({ data: { name, code, address } });

  revalidatePath("/branches");
  redirect("/branches");
}

export async function updateBranch(id: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const address = (formData.get("address") as string)?.trim() || null;

  if (!name || !code) throw new Error("Name and code are required");

  await prisma.branch.update({ where: { id }, data: { name, code, address } });

  revalidatePath("/branches");
  redirect("/branches");
}

export async function deleteBranch(id: string) {
  await prisma.branch.delete({ where: { id } });
  revalidatePath("/branches");
}
