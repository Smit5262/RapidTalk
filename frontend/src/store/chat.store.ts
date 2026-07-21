import { create } from "zustand";
import type { Message, TypingUser } from "@/types/message.types";

interface ChatState {
  messagesByChannel: Record<string, Message[]>;
  typingByChannel: Record<string, TypingUser[]>;

  setInitialMessages: (channelId: string, messages: Message[]) => void;
  prependMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, message: Message) => void;
  removeMessage: (channelId: string, messageId: string) => void;
  applyReaction: (
    channelId: string,
    messageId: string,
    userId: string,
    emoji: string,
    added: boolean,
  ) => void;

  setTyping: (channelId: string, user: TypingUser, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messagesByChannel: {},
  typingByChannel: {},

  setInitialMessages: (channelId, messages) =>
    set((state) => ({
      messagesByChannel: { ...state.messagesByChannel, [channelId]: messages },
    })),

  prependMessages: (channelId, messages) =>
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: [...messages, ...(state.messagesByChannel[channelId] ?? [])],
      },
    })),

  addMessage: (channelId, message) =>
    set((state) => {
      const existing = state.messagesByChannel[channelId] ?? [];
      if (existing.some((m) => m.id === message.id)) return state;
      return { messagesByChannel: { ...state.messagesByChannel, [channelId]: [...existing, message] } };
    }),

  updateMessage: (channelId, message) =>
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: (state.messagesByChannel[channelId] ?? []).map((m) =>
          m.id === message.id ? message : m,
        ),
      },
    })),

  removeMessage: (channelId, messageId) =>
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: (state.messagesByChannel[channelId] ?? []).filter((m) => m.id !== messageId),
      },
    })),

  applyReaction: (channelId, messageId, userId, emoji, added) =>
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: (state.messagesByChannel[channelId] ?? []).map((m) => {
          if (m.id !== messageId) return m;
          const reactions = added
            ? [...m.reactions, { id: `${messageId}-${userId}-${emoji}`, messageId, userId, emoji, createdAt: new Date().toISOString() }]
            : m.reactions.filter((r) => !(r.userId === userId && r.emoji === emoji));
          return { ...m, reactions };
        }),
      },
    })),

  setTyping: (channelId, user, isTyping) =>
    set((state) => {
      const current = state.typingByChannel[channelId] ?? [];
      const next = isTyping
        ? [...current.filter((u) => u.userId !== user.userId), user]
        : current.filter((u) => u.userId !== user.userId);
      return { typingByChannel: { ...state.typingByChannel, [channelId]: next } };
    }),
}));