"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      branchId: true,
      createdAt: true,
      branch: { select: { name: true, code: true } },
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, branchId: true },
  });
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "STAFF";
  const branchId = (formData.get("branchId") as string) || null;

  if (!name || !email || !password) throw new Error("Missing required fields");

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role as "ADMIN" | "MANAGER" | "STAFF",
      branchId: branchId || null,
    },
  });

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUser(id: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = (formData.get("role") as string) || "STAFF";
  const branchId = (formData.get("branchId") as string) || null;
  const newPassword = formData.get("password") as string;

  if (!name || !email) throw new Error("Missing required fields");

  const data: Record<string, unknown> = {
    name,
    email,
    role: role as "ADMIN" | "MANAGER" | "STAFF",
    branchId: branchId || null,
  };

  if (newPassword) {
    data.password = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({ where: { id }, data });

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUser(id: string) {
  await requireAdmin();
  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
}
