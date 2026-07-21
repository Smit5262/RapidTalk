import { useEffect, useRef } from "react";
import { MessagesSquare } from "lucide-react";
import { useChatStore } from "@/store/chat.store";
import { MessageItem } from "./MessageItem";

interface Props {
  workspaceId: string;
  channelId: string;
}

export function MessageList({ workspaceId, channelId }: Props) {
  const messages = useChatStore((s) => s.messagesByChannel[channelId] ?? []);
  const typingUsers = useChatStore((s) => s.typingByChannel[channelId] ?? []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin py-4">
      {messages.length === 0 && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <div className="relative mx-auto mb-4 w-fit">
              <div aria-hidden className="absolute inset-0 -z-10 rounded-2xl bg-primary/25 blur-xl" />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-glow">
                <MessagesSquare size={22} />
              </div>
            </div>
            <p className="text-base font-semibold tracking-tight">No messages yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start the conversation by sending a message.
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div key={message.id} className="animate-fade-in">
          <MessageItem
            message={message}
            workspaceId={workspaceId}
            channelId={channelId}
          />
        </div>
      ))}

      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground animate-fade-in">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70" />
          </span>
          <span>
            {typingUsers.map((u) => u.name).join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
