import { useState } from "react";
import { Hash, Lock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCreateChannel } from "./useChannels";
import type { ChannelType } from "@/types/workspace.types";
import { cn } from "@/shared/lib/cn";

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
    <Modal open={open} onClose={onClose} title="Create a channel" description="Channels are where your team communicates.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="channel-name">
            Channel name
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Hash size={16} />
            </span>
            <input
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
              placeholder="general"
              autoFocus
              className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm shadow-xs transition-all duration-150 placeholder:text-muted-foreground hover:border-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Visibility</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("PUBLIC")}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                type === "PUBLIC"
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-input hover:border-muted-foreground/30 hover:bg-accent"
              )}
            >
              <Hash size={16} />
              <span>Public</span>
            </button>
            <button
              type="button"
              onClick={() => setType("PRIVATE")}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                type === "PRIVATE"
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-input hover:border-muted-foreground/30 hover:bg-accent"
              )}
            >
              <Lock size={16} />
              <span>Private</span>
            </button>
          </div>
        </div>

        {createChannel.isError && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2.5">
            <p className="text-sm text-destructive">
              Could not create channel. Try again.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createChannel.isPending || !name.trim()}
          >
            {createChannel.isPending ? "Creating..." : "Create channel"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
