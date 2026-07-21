import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { logger } from "../config/logger";

export async function auditLog(data: {
  workspaceId?: string;
  userId?: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        action: data.action,
        metadata: data.metadata as unknown as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    logger.error({ err, action: data.action }, "Failed to write audit log");
  }
}
