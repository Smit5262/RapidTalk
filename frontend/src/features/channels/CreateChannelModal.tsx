import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCreateChannel } from "./useChannels";
import type { ChannelType } from "@/types/workspace.types";

interface Props {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}

export function CreateChannelModal({ workspaceId, open, onClose }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ChannelType>("PUBLIC");
  const createChannel = useCreateChannel(workspaceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createChannel.mutateAsync({ name: name.trim(), type });
    setName("");
    setType("PUBLIC");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a channel">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="channel-name">
            Channel name
          </label>
          <input
            id="channel-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="general"
            autoFocus
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Visibility</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("PUBLIC")}
              className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                type === "PUBLIC" ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => setType("PRIVATE")}
              className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                type === "PRIVATE" ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              Private
            </button>
          </div>
        </div>

        {createChannel.isError && (
          <p className="text-sm text-red-500">Could not create channel. Try again.</p>
        )}

        <button
          type="submit"
          disabled={createChannel.isPending || !name.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {createChannel.isPending ? "Creating…" : "Create channel"}
        </button>
      </form>
    </Modal>
  );
}