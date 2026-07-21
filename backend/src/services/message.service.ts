import { AppError } from "../utils/AppError";
import { messageRepository } from "../repositories/message.repository";
import { userRepository } from "../repositories/auth.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { notificationService } from "./notification.service";
import { emitToUser } from "../socket/emitter";
import { EditMessageInput, ListMessagesQuery, SendMessageInput } from "../validators/message.validator";

export const messageService = {
  async send(channelId: string, authorId: string, input: SendMessageInput, workspaceId?: string) {
    const message = await messageRepository.create({
      channelId,
      authorId,
      content: input.content,
      parentId: input.parentId,
      attachments: input.attachments,
    });

    // Create mention notifications for @username mentions
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(input.content)) !== null) {
      const mentionedName = match[1];
      const mentionedUser = await userRepository.findByEmail(`${mentionedName}@placeholder.com`);
      if (mentionedUser && mentionedUser.id !== authorId) {
        const author = await userRepository.findById(authorId);
        const notification = await notificationService.create({
          userId: mentionedUser.id,
          workspaceId,
          type: "MENTION",
          payload: {
            messageId: message.id,
            channelId,
            workspaceId,
            mentionedByName: author?.name ?? "Someone",
            content: input.content.slice(0, 200),
          },
        });
        emitToUser(mentionedUser.id, "notification:new", notification);
      }
    }

    return message;
  },

  list(channelId: string, query: ListMessagesQuery) {
    return messageRepository.listByChannel(channelId, {
      cursor: query.cursor,
      limit: query.limit,
      parentId: query.parentId,
    });
  },

  async edit(messageId: string, userId: string, input: EditMessageInput) {
    const message = await messageRepository.findById(messageId);
    if (!message || message.isDeleted) {
      throw new AppError("Message not found", 404);
    }
    if (message.authorId !== userId) {
      throw new AppError("You can only edit your own messages", 403);
    }

    return messageRepository.update(messageId, input.content);
  },

  async remove(messageId: string, userId: string) {
    const message = await messageRepository.findById(messageId);
    if (!message || message.isDeleted) {
      throw new AppError("Message not found", 404);
    }
    if (message.authorId !== userId) {
      throw new AppError("You can only delete your own messages", 403);
    }

    await messageRepository.softDelete(messageId);
  },

  async toggleReaction(messageId: string, userId: string, emoji: string) {
    const message = await messageRepository.findById(messageId);
    if (!message || message.isDeleted) {
      throw new AppError("Message not found", 404);
    }

    const existing = await messageRepository.findReaction(messageId, userId, emoji);
    if (existing) {
      await messageRepository.removeReaction(existing.id);
      return { added: false, emoji };
    }

    await messageRepository.addReaction(messageId, userId, emoji);
    return { added: true, emoji };
  },
};