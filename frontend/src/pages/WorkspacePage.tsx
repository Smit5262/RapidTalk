import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useWorkspace } from "@/features/workspaces/useWorkspaces";

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data: workspace } = useWorkspace(workspaceId ?? null);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);

  useEffect(() => {
    if (workspaceId) setCurrentWorkspace(workspaceId);
  }, [workspaceId, setCurrentWorkspace]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium">{workspace?.name ?? "Loading…"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a channel from the sidebar, or create one to start talking.
        </p>
      </div>
    </div>
  );
}