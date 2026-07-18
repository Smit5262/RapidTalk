import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
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
    <Modal open={open} onClose={onClose} title="Create a workspace">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="workspace-name">
            Workspace name
          </label>
          <input
            id="workspace-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Corp"
            autoFocus
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {createWorkspace.isError && (
          <p className="text-sm text-red-500">Could not create workspace. Try again.</p>
        )}

        <button
          type="submit"
          disabled={createWorkspace.isPending || !name.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {createWorkspace.isPending ? "Creating…" : "Create workspace"}
        </button>
      </form>
    </Modal>
  );
}