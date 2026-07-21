import { useEffect } from "react";
import { getSocket } from "@/services/socket";
import { useNotificationStore } from "@/store/notification.store";
import type { Notification } from "@/types/notification.types";

export function useNotificationSocket() {
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNew = (notification: Notification) => {
      addNotification(notification);
    };

    socket.on("notification:new", onNew);

    return () => {
      socket.off("notification:new", onNew);
    };
  }, [addNotification]);
}
