import { create } from "zustand";
import type { Notification } from "@/types/notification.types";

interface NotificationState {
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => ({
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  decrementUnread: () =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}));
