import { useState } from "react";
import { Building2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCreateWorkspace } from "./useWorkspaces";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (workspaceId: string) => void;
}

export function CreateWorkspaceModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const createWorkspace = useCreateWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const workspace = await createWorkspace.mutateAsync({ name: name.trim() });
    setName("");
    onCreated(workspace.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a workspace" description="Workspaces help you organize your team's conversations.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="workspace-name">
            Workspace name
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Building2 size={16} />
            </span>
            <input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corp"
              autoFocus
              className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm shadow-xs transition-all duration-150 placeholder:text-muted-foreground hover:border-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20"
            />
          </div>
        </div>

        {createWorkspace.isError && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2.5">
            <p className="text-sm text-destructive">
              Could not create workspace. Try again.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createWorkspace.isPending || !name.trim()}
          >
            {createWorkspace.isPending ? "Creating..." : "Create workspace"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
