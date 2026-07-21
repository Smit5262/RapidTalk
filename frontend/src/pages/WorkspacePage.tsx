import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash, MessagesSquare, Plus, Sparkles } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useWorkspace } from "@/features/workspaces/useWorkspaces";
import { CreateChannelModal } from "@/features/channels/CreateChannelModal";
import { Button } from "@/components/ui/Button";

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data: workspace } = useWorkspace(workspaceId ?? null);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (workspaceId) setCurrentWorkspace(workspaceId);
  }, [workspaceId, setCurrentWorkspace]);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md text-center"
      >
        <div className="relative mx-auto mb-6 w-fit">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-2xl bg-primary/30 blur-2xl"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white shadow-glow">
            <MessagesSquare size={28} />
          </div>
        </div>

        <h2 className="text-xl font-semibold tracking-tight">
          {workspace?.name ?? "Loading…"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
          Pick a channel from the sidebar to jump into the conversation, or create a
          new one to get your team talking.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus size={16} />
            Create channel
          </Button>
        </div>

        <div className="mx-auto mt-8 grid max-w-sm grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
          <div className="surface-card flex items-start gap-2.5 rounded-xl border border-border/70 p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
              <Hash size={14} />
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Organize conversations into public and private channels.
            </p>
          </div>
          <div className="surface-card flex items-start gap-2.5 rounded-xl border border-border/70 p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
              <Sparkles size={14} />
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Summarize, translate, and draft replies with built-in AI.
            </p>
          </div>
        </div>
      </motion.div>

      {workspaceId && (
        <CreateChannelModal
          workspaceId={workspaceId}
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}
