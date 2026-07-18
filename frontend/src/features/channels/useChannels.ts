import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Channel, ChannelType } from "@/types/workspace.types";

export function useChannels(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "channels"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Channel[] }>(`/workspaces/${workspaceId}/channels`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateChannel(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; type?: ChannelType; topic?: string }) => {
      const { data } = await api.post<{ data: Channel }>(`/workspaces/${workspaceId}/channels`, input);
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "channels"] }),
  });
}

export function useJoinChannel(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => api.post(`/workspaces/${workspaceId}/channels/${channelId}/join`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "channels"] }),
  });
}

export function useLeaveChannel(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => api.post(`/workspaces/${workspaceId}/channels/${channelId}/leave`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "channels"] }),
  });
}

export function useToggleChannelPin(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => api.patch(`/workspaces/${workspaceId}/channels/${channelId}/pin`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "channels"] }),
  });
}