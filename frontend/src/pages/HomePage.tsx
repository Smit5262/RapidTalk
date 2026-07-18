import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaces } from "@/features/workspaces/useWorkspaces";
import { useWorkspaceStore } from "@/store/workspace.store";

export default function HomePage() {
  const navigate = useNavigate();
  const { data: workspaces, isLoading } = useWorkspaces();
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);

  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      setCurrentWorkspace(workspaces[0].id);
      navigate(`/w/${workspaces[0].id}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces]);

  if (isLoading) return null;

  if (workspaces && workspaces.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">No workspaces yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create one from the sidebar to get started.
          </p>
        </div>
      </div>
    );
  }

  return null;
}