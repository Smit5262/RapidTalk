import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export const notificationRepository = {
  create(data: {
    userId: string;
    workspaceId?: string;
    type: NotificationType;
    payload: Record<string, unknown>;
  }) {
    return prisma.notification.create({
      data: { ...data, payload: data.payload as unknown as Prisma.InputJsonValue },
    });
  },

  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  async listByUser(userId: string, opts: { cursor?: string; limit: number }) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: opts.limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    const hasMore = notifications.length > opts.limit;
    const page = hasMore ? notifications.slice(0, opts.limit) : notifications;

    return { notifications: page, hasMore };
  },

  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
