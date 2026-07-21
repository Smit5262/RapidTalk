import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/services/api";
import { useChatStore } from "@/store/chat.store";
import type { Message, MessagePage } from "@/types/message.types";

export function useMessageHistory(workspaceId: string, channelId: string | null) {
  const setInitialMessages = useChatStore((s) => s.setInitialMessages);

  const query = useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      const { data } = await api.get<{ data: MessagePage }>(
        `/workspaces/${workspaceId}/channels/${channelId}/messages`,
      );
      return data.data;
    },
    enabled: !!channelId,
  });

  useEffect(() => {
    if (query.data && channelId) {
      setInitialMessages(channelId, query.data.messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, channelId]);

  return query;
}

export function useSendMessage(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: async (input: { content: string; parentId?: string }) => {
      const { data } = await api.post<{ data: Message }>(
        `/workspaces/${workspaceId}/channels/${channelId}/messages`,
        input,
      );
      return data.data;
    },
  });
}

export function useEditMessage(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const { data } = await api.patch<{ data: Message }>(
        `/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}`,
        { content },
      );
      return data.data;
    },
  });
}

export function useDeleteMessage(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: (messageId: string) =>
      api.delete(`/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}`),
  });
}

export function useToggleReaction(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      api.post(`/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}/reactions`, { emoji }),
  });
}

export function useQueryClientInvalidateMessages() {
  const queryClient = useQueryClient();
  return (channelId: string) => queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
}