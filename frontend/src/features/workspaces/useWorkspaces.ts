import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Workspace, WorkspaceMember, WorkspaceRole } from "@/types/workspace.types";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Workspace[] }>("/workspaces");
      return data.data;
    },
  });
}

export function useWorkspace(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspaces", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Workspace }>(`/workspaces/${workspaceId}`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string }) => {
      const { data } = await api.post<{ data: Workspace }>("/workspaces", input);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}

export function useWorkspaceMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "members"],
    queryFn: async () => {
      const { data } = await api.get<{ data: WorkspaceMember[] }>(`/workspaces/${workspaceId}/members`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateInvite(workspaceId: string) {
  return useMutation({
    mutationFn: async (input: { email?: string; role?: WorkspaceRole; expiresInDays?: number }) => {
      const { data } = await api.post(`/workspaces/${workspaceId}/invites`, input);
      return data.data as { token: string; expiresAt: string };
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post(`/workspaces/invites/${token}/accept`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}