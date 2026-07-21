import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useSummarizeChannel(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: async (sinceMessageId?: string) => {
      const { data } = await api.post<{ data: { summary: string } }>(
        `/workspaces/${workspaceId}/channels/${channelId}/ai/summarize`,
        { sinceMessageId },
      );
      return data.data.summary;
    },
  });
}

export function useSuggestReplies(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: { suggestions: string[] } }>(
        `/workspaces/${workspaceId}/channels/${channelId}/ai/suggest-replies`,
      );
      return data.data.suggestions;
    },
  });
}

export function useGenerateMeetingNotes(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { data } = await api.post<{ data: { notes: string } }>(
        `/workspaces/${workspaceId}/channels/${channelId}/ai/meeting-notes`,
        { messageIds },
      );
      return data.data.notes;
    },
  });
}

export function useTranslateMessage(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: async ({ content, targetLanguage }: { content: string; targetLanguage: string }) => {
      const { data } = await api.post<{ data: { translation: string } }>(
        `/workspaces/${workspaceId}/channels/${channelId}/ai/translate`,
        { content, targetLanguage },
      );
      return data.data.translation;
    },
  });
}

export function useRewriteMessage(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: async ({ content, tone }: { content: string; tone: "professional" | "casual" | "concise" }) => {
      const { data } = await api.post<{ data: { rewritten: string } }>(
        `/workspaces/${workspaceId}/channels/${channelId}/ai/rewrite`,
        { content, tone },
      );
      return data.data.rewritten;
    },
  });
}

export function useExtractActionItems(workspaceId: string, channelId: string) {
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post<{ data: { tasks: Array<{ title: string; assignee: string | null; dueDate: string | null }> } }>(
        `/workspaces/${workspaceId}/channels/${channelId}/ai/extract-action-item`,
        { content },
      );
      return data.data.tasks;
    },
  });
}
