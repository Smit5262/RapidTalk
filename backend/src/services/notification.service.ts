import { NotificationType } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { notificationRepository } from "../repositories/notification.repository";
import { workspaceService } from "./workspace.service";
import { ListNotificationsQuery } from "../validators/notification.validator";

export const notificationService = {
  create(data: {
    userId: string;
    workspaceId?: string;
    type: NotificationType;
    payload: Record<string, unknown>;
  }) {
    return notificationRepository.create(data);
  },

  list(userId: string, query: ListNotificationsQuery) {
    return notificationRepository.listByUser(userId, {
      cursor: query.cursor,
      limit: query.limit,
    });
  },

  async markRead(notificationId: string, userId: string) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
    if (notification.userId !== userId) {
      throw new AppError("You can only modify your own notifications", 403);
    }

    return notificationRepository.markRead(notificationId);
  },

  async acceptInvite(notificationId: string, userId: string) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
    if (notification.userId !== userId) {
      throw new AppError("You can only modify your own notifications", 403);
    }
    if (notification.type !== "WORKSPACE_INVITE") {
      throw new AppError("This notification is not a workspace invite", 400);
    }

    const payload = notification.payload as { inviteToken: string };
    const member = await workspaceService.acceptInvite(payload.inviteToken, userId);
    await notificationRepository.markRead(notificationId);

    return member;
  },

  async decline(notificationId: string, userId: string) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
    if (notification.userId !== userId) {
      throw new AppError("You can only modify your own notifications", 403);
    }

    return notificationRepository.markRead(notificationId);
  },

  countUnread(userId: string) {
    return notificationRepository.countUnread(userId);
  },

  markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  },
};
