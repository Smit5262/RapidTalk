import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessagesSquare, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useWorkspaces } from "@/features/workspaces/useWorkspaces";
import { useWorkspaceStore } from "@/store/workspace.store";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { CreateWorkspaceModal } from "@/features/workspaces/CreateWorkspaceModal";

export default function HomePage() {
  const navigate = useNavigate();
  const { data: workspaces, isLoading, isError, refetch } = useWorkspaces();
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      setCurrentWorkspace(workspaces[0].id);
      navigate(`/w/${workspaces[0].id}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces]);

  function handleCreated(id: string) {
    setCurrentWorkspace(id);
    navigate(`/w/${id}`, { replace: true });
  }

  if (isLoading) {
    return <PageLoader label="Loading your workspaces" />;
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          title="Couldn't load your workspaces"
          message="Check your connection and try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (workspaces && workspaces.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyState
            icon={<MessagesSquare size={26} className="text-primary" />}
            title="Create your first workspace"
            description="Workspaces keep your team's channels and conversations organized. Spin one up to get started."
            action={
              <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus size={16} />
                Create workspace
              </Button>
            }
          />
        </motion.div>
        <CreateWorkspaceModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      </div>
    );
  }

  return <PageLoader label="Opening workspace" />;
}
