import { prisma } from "@nutrivae/database";
import type { Request } from "express";

export async function audit(
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: object
) {
  await prisma.auditLog.create({
    data: { actorId: req.user?.id, action, entityType, entityId, metadata, ipAddress: req.ip }
  });
}
