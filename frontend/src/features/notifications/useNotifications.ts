import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { NotificationPage } from "@/types/notification.types";
import { useNotificationStore } from "@/store/notification.store";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<{ data: NotificationPage }>("/notifications", {
        params: { limit: 20 },
      });
      return data.data;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      decrementUnread();
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setUnreadCount(0);
    },
  });
}

export function useAcceptWorkspaceInvite() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/notifications/${id}/accept`);
      return data.data as { workspaceId: string };
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      decrementUnread();
      navigate(`/w/${member.workspaceId}`);
    },
  });
}

export function useDeclineNotification() {
  const queryClient = useQueryClient();
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/notifications/${id}/decline`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      decrementUnread();
    },
  });
}
