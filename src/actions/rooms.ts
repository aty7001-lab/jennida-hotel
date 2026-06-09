"use server";

import prisma from "@/lib/prisma";

export async function getRoomsByBranch(branchId?: string) {
  try {
    const whereClause = branchId ? { branchId } : {};
    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        branch: true,
      },
      orderBy: { number: "asc" },
    });
    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
}

export async function getRoomById(id: string) {
  try {
    return await prisma.room.findUnique({
      where: { id },
      include: { branch: true },
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return null;
  }
}

export async function getRoomSummaryByBranch(branchId?: string) {
  try {
    const rooms = await getRoomsByBranch(branchId);
    const total = rooms.length;
    const available = rooms.filter(r => r.status === "AVAILABLE").length;
    const occupied = rooms.filter(r => r.status === "OCCUPIED").length;
    
    return {
      total,
      available,
      occupied,
      occupancyRate: total === 0 ? 0 : Math.round((occupied / total) * 100),
    };
  } catch (error) {
    return { total: 0, available: 0, occupied: 0, occupancyRate: 0 };
  }
}
