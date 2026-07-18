import { create } from "zustand";

interface WorkspaceState {
  currentWorkspaceId: string | null;
  setCurrentWorkspace: (id: string) => void;
  clear: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspaceId: null,
  setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),
  clear: () => set({ currentWorkspaceId: null }),
}));