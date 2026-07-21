import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export interface DashboardOverview {
  messagesSent: number;
  activeUsers: number;
  filesShared: number;
  channelCount: number;
  aiUsageCount: number;
}

export interface DashboardActivity {
  dailyCounts: Record<string, number>;
  hourlyByWeekday: Record<string, number>;
}

export interface DashboardRecentEvent {
  id: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export function useDashboardOverview(workspaceId: string | null) {
  return useQuery({
    queryKey: ["dashboard", workspaceId, "overview"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardOverview }>(
        `/workspaces/${workspaceId}/dashboard/overview`,
      );
      return data.data;
    },
    enabled: !!workspaceId,
  });
}

export function useDashboardActivity(workspaceId: string | null) {
  return useQuery({
    queryKey: ["dashboard", workspaceId, "activity"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardActivity }>(
        `/workspaces/${workspaceId}/dashboard/activity`,
      );
      return data.data;
    },
    enabled: !!workspaceId,
  });
}

export function useDashboardRecent(workspaceId: string | null) {
  return useQuery({
    queryKey: ["dashboard", workspaceId, "recent"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardRecentEvent[] }>(
        `/workspaces/${workspaceId}/dashboard/recent`,
      );
      return data.data;
    },
    enabled: !!workspaceId,
  });
}
