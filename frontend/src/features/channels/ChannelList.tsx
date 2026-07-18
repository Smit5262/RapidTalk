import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Hash, Lock, Plus } from "lucide-react";
import { useChannels } from "./useChannels";
import { CreateChannelModal } from "./CreateChannelModal";

interface Props {
  workspaceId: string;
}

export function ChannelList({ workspaceId }: Props) {
  const { data: channels, isLoading } = useChannels(workspaceId);
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 px-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  const pinned = channels?.filter((c) => c.members?.[0]?.isPinned) ?? [];
  const others = channels?.filter((c) => !c.members?.[0]?.isPinned) ?? [];

  return (
    <div className="flex flex-col gap-3">
      {pinned.length > 0 && (
        <div>
          <div className="px-2 text-xs font-semibold uppercase text-muted-foreground">Pinned</div>
          <div className="mt-1 flex flex-col">
            {pinned.map((c) => (
              <ChannelLink key={c.id} workspaceId={workspaceId} id={c.id} name={c.name} type={c.type} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Channels</span>
          <button onClick={() => setModalOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Plus size={14} />
          </button>
        </div>
        <div className="mt-1 flex flex-col">
          {others.length === 0 && (
            <div className="px-2 py-1 text-sm text-muted-foreground">No channels yet.</div>
          )}
          {others.map((c) => (
            <ChannelLink key={c.id} workspaceId={workspaceId} id={c.id} name={c.name} type={c.type} />
          ))}
        </div>
      </div>

      <CreateChannelModal workspaceId={workspaceId} open={modalOpen} onClose={() => setModalOpen(false)} />
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
        `flex items-center gap-1.5 rounded px-2 py-1 text-sm ${
          isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
        }`
      }
    >
      {type === "PRIVATE" ? <Lock size={13} /> : <Hash size={13} />}
      <span className="truncate">{name}</span>
    </NavLink>
  );
}