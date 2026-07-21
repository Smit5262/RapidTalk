import { useState } from "react";
import { useParams } from "react-router-dom";
import { Hash, Lock, Sparkles, Users, Settings } from "lucide-react";
import { useChannels } from "@/features/channels/useChannels";
import { useMessageHistory } from "@/features/messages/useMessages";
import { useChannelSocket } from "@/features/messages/useChannelSocket";
import { MessageList } from "@/features/messages/MessageList";
import { MessageComposer } from "@/features/messages/MessageComposer";
import { AISidebar } from "@/features/ai/AISidebar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/shared/lib/cn";

export default function ChannelPage() {
  const { workspaceId, channelId } = useParams<{ workspaceId: string; channelId: string }>();
  const { data: channels } = useChannels(workspaceId ?? null);
  const channel = channels?.find((c) => c.id === channelId);
  const [aiOpen, setAiOpen] = useState(false);

  useMessageHistory(workspaceId!, channelId ?? null);
  useChannelSocket(workspaceId!, channelId ?? null);

  if (!workspaceId || !channelId) return null;

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        {/* Channel header */}
        <div className="glass flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg gradient-primary text-white shadow-sm shadow-primary/25">
              {channel?.type === "PRIVATE" ? (
                <Lock size={14} />
              ) : (
                <Hash size={14} />
              )}
            </div>
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-sm font-semibold">{channel?.name ?? "channel"}</span>
              {channel?.topic && (
                <span className="hidden truncate text-sm text-muted-foreground sm:inline">
                  {channel.topic}
                </span>
              )}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Channel members"
            >
              <Users size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Channel settings"
            >
              <Settings size={16} />
            </Button>
            <div className="mx-1 h-5 w-px bg-border" />
            <Button
              variant={aiOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setAiOpen((v) => !v)}
              className={cn(
                "gap-1.5",
                aiOpen && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
              )}
            >
              <Sparkles size={14} />
              AI
            </Button>
          </div>
        </div>

        {/* Messages */}
        <MessageList workspaceId={workspaceId} channelId={channelId} />

        {/* Composer */}
        <MessageComposer workspaceId={workspaceId} channelId={channelId} />
      </div>

      {/* AI Sidebar */}
      <AISidebar
        workspaceId={workspaceId}
        channelId={channelId}
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onInsertReply={() => setAiOpen(false)}
      />
    </div>
  );
}
