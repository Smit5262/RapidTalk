import { useParams } from "react-router-dom";
import { Hash } from "lucide-react";
import { useChannels } from "@/features/channels/useChannels";

export default function ChannelPage() {
  const { workspaceId, channelId } = useParams<{ workspaceId: string; channelId: string }>();
  const { data: channels } = useChannels(workspaceId ?? null);
  const channel = channels?.find((c) => c.id === channelId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Hash size={16} className="text-muted-foreground" />
        <span className="font-medium">{channel?.name ?? "channel"}</span>
        {channel?.topic && <span className="text-sm text-muted-foreground">— {channel.topic}</span>}
      </div>

      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Messaging, threads, and reactions land here in Phase 3.
        </p>
      </div>
    </div>
  );
}