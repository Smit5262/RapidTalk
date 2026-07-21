import { dashboardRepository } from "../repositories/dashboard.repository";

export const dashboardService = {
  getOverview(workspaceId: string) {
    return dashboardRepository.getOverview(workspaceId);
  },

  getActivity(workspaceId: string) {
    return dashboardRepository.getActivity(workspaceId);
  },

  getRecent(workspaceId: string) {
    return dashboardRepository.getRecent(workspaceId);
  },
};
