import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useWorkspaces } from "./useWorkspaces";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { data: workspaces, isLoading } = useWorkspaces();
  const { currentWorkspaceId, setCurrentWorkspace } = useWorkspaceStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const current = workspaces?.find((w) => w.id === currentWorkspaceId);

  function select(workspaceId: string) {
    setCurrentWorkspace(workspaceId);
    setDropdownOpen(false);
    navigate(`/w/${workspaceId}`);
  }

  if (isLoading) {
    return <div className="h-9 animate-pulse rounded-md bg-muted" />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-semibold hover:bg-muted"
      >
        <span className="truncate">{current?.name ?? "Select workspace"}</span>
        <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
      </button>

      {dropdownOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-md border border-border bg-background p-1 shadow-md">
          {workspaces?.length === 0 && (
            <div className="px-2 py-2 text-sm text-muted-foreground">No workspaces yet.</div>
          )}
          {workspaces?.map((w) => (
            <button
              key={w.id}
              onClick={() => select(w.id)}
              className="flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
            >
              {w.name}
            </button>
          ))}
          <div className="my-1 border-t border-border" />
          <button
            onClick={() => {
              setDropdownOpen(false);
              setModalOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-primary hover:bg-muted"
          >
            <Plus size={14} /> Create workspace
          </button>
        </div>
      )}

      <CreateWorkspaceModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={select} />
    </div>
  );
}