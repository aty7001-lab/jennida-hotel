"use server";

import prisma from "@/lib/prisma";

export async function getAllBranches() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" },
    });
    return branches;
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}
