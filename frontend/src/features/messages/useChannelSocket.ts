import { useEffect } from "react";
import { getSocket } from "@/services/socket";
import { useChatStore } from "@/store/chat.store";
import type { Message } from "@/types/message.types";

interface ReactionEvent {
  messageId: string;
  userId: string;
  emoji: string;
  added: boolean;
}

interface TypingEvent {
  channelId: string;
  userId: string;
  name: string;
  isTyping: boolean;
}

export function useChannelSocket(workspaceId: string, channelId: string | null) {
  const { addMessage, updateMessage, removeMessage, applyReaction, setTyping } = useChatStore();

  useEffect(() => {
    if (!channelId) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("channel:join", { workspaceId, channelId });

    const onNew = (message: Message) => {
      if (message.channelId === channelId) addMessage(channelId, message);
    };
    const onUpdated = (message: Message) => {
      if (message.channelId === channelId) updateMessage(channelId, message);
    };
    const onDeleted = ({ id }: { id: string }) => removeMessage(channelId, id);
    const onReaction = (e: ReactionEvent) => applyReaction(channelId, e.messageId, e.userId, e.emoji, e.added);
    const onTyping = (e: TypingEvent) => {
      if (e.channelId === channelId) setTyping(channelId, { userId: e.userId, name: e.name }, e.isTyping);
    };

    socket.on("message:new", onNew);
    socket.on("message:updated", onUpdated);
    socket.on("message:deleted", onDeleted);
    socket.on("message:reaction", onReaction);
    socket.on("typing:update", onTyping);

    return () => {
      socket.emit("channel:leave", { workspaceId, channelId });
      socket.off("message:new", onNew);
      socket.off("message:updated", onUpdated);
      socket.off("message:deleted", onDeleted);
      socket.off("message:reaction", onReaction);
      socket.off("typing:update", onTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, channelId]);
}