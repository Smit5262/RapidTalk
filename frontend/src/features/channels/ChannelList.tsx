import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Hash, Lock, Plus } from "lucide-react";

import { useChannels } from "./useChannels";
import { CreateChannelModal } from "./CreateChannelModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/shared/lib/cn";

interface Props {
  workspaceId: string;
}

export function ChannelList({ workspaceId }: Props) {
  const { data: channels, isLoading } = useChannels(workspaceId);
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 px-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded-lg bg-sidebar-accent" />
        ))}
      </div>
    );
  }

  const pinned = channels?.filter((c) => c.members?.[0]?.isPinned) ?? [];
  const others = channels?.filter((c) => !c.members?.[0]?.isPinned) ?? [];

  return (
    <div className="flex flex-col gap-1">
      {pinned.length > 0 && (
        <div className="mb-1">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pinned
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {pinned.map((c) => (
              <ChannelLink
                key={c.id}
                workspaceId={workspaceId}
                id={c.id}
                name={c.name}
                type={c.type}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Channels
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setModalOpen(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Create channel"
          >
            <Plus size={14} />
          </Button>
        </div>
        <div className="flex flex-col gap-0.5">
          {others.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No channels yet.
            </div>
          )}
          {others.map((c) => (
            <ChannelLink
              key={c.id}
              workspaceId={workspaceId}
              id={c.id}
              name={c.name}
              type={c.type}
            />
          ))}
        </div>
      </div>

      <CreateChannelModal
        workspaceId={workspaceId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

function ChannelLink({
  workspaceId,
  id,
  name,
  type,
}: {
  workspaceId: string;
  id: string;
  name: string;
  type: string;
}) {
  return (
    <NavLink
      to={`/w/${workspaceId}/c/${id}`}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-150",
          "before:absolute before:left-0 before:top-1/2 before:h-0 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary before:transition-all before:duration-200",
          isActive
            ? "bg-primary/10 font-medium text-primary before:h-4"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        )
      }
    >
      {type === "PRIVATE" ? (
        <Lock size={14} className="shrink-0" />
      ) : (
        <Hash size={14} className="shrink-0" />
      )}
      <span className="truncate">{name}</span>
    </NavLink>
  );
}
