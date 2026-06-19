"use server";

import prisma from "@/lib/prisma";

export async function createAuditLog(params: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export async function getAuditLogsByEntity(entityId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { entityId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAuditLogs(limit = 50) {
  return prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
