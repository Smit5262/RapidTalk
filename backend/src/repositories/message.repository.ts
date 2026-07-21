import { prisma } from "../config/database";

const AUTHOR_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
} as const;

export const messageRepository = {
  create(data: {
    channelId: string;
    authorId: string;
    content: string;
    parentId?: string;
    attachments?: Array<{ fileUrl: string; fileName: string; mimeType: string; sizeBytes: number }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          channelId: data.channelId,
          authorId: data.authorId,
          content: data.content,
          parentId: data.parentId,
        },
        include: {
          author: { select: AUTHOR_SELECT },
          reactions: true,
          _count: { select: { replies: true } },
        },
      });

      if (data.attachments && data.attachments.length > 0) {
        await tx.attachment.createMany({
          data: data.attachments.map((a) => ({ ...a, messageId: message.id })),
        });
        const attachments = await tx.attachment.findMany({
          where: { messageId: message.id },
          orderBy: { createdAt: "asc" },
        });
        return { ...message, attachments };
      }

      return { ...message, attachments: [] };
    });
  },

  findById(id: string) {
    return prisma.message.findUnique({ where: { id } });
  },

  async listByChannel(
    channelId: string,
    opts: { cursor?: string; limit: number; parentId?: string },
  ) {
    const messages = await prisma.message.findMany({
      where: {
        channelId,
        isDeleted: false,
        parentId: opts.parentId ?? null,
      },
      include: {
        author: { select: AUTHOR_SELECT },
        reactions: true,
        attachments: true,
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      take: opts.limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > opts.limit;
    const page = hasMore ? messages.slice(0, opts.limit) : messages;

    return { messages: page.reverse(), hasMore };
  },

  update(id: string, content: string) {
    return prisma.message.update({
      where: { id },
      data: { content, isEdited: true },
      include: { author: { select: AUTHOR_SELECT }, reactions: true, attachments: true, _count: { select: { replies: true } } },
    });
  },

  softDelete(id: string) {
    return prisma.message.update({
      where: { id },
      data: { isDeleted: true, content: "" },
    });
  },

  findReaction(messageId: string, userId: string, emoji: string) {
    return prisma.reaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
    });
  },

  addReaction(messageId: string, userId: string, emoji: string) {
    return prisma.reaction.create({ data: { messageId, userId, emoji } });
  },

  removeReaction(id: string) {
    return prisma.reaction.delete({ where: { id } });
  },
};