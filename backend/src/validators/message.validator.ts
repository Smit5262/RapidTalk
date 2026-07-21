import { z } from "zod";

const attachmentInput = z.object({
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().min(1),
});

export const sendMessageSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid(), channelId: z.string().uuid() }),
  body: z.object({
    content: z.string().min(1).max(10000),
    parentId: z.string().uuid().optional(),
    attachments: z.array(attachmentInput).max(10).optional(),
  }),
});

export const editMessageSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid(), channelId: z.string().uuid(), messageId: z.string().uuid() }),
  body: z.object({
    content: z.string().min(1).max(10000),
  }),
});

export const messageParamsSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid(), channelId: z.string().uuid(), messageId: z.string().uuid() }),
});

export const listMessagesSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid(), channelId: z.string().uuid() }),
  query: z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    parentId: z.string().uuid().optional(),
  }),
});

export const reactSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid(), channelId: z.string().uuid(), messageId: z.string().uuid() }),
  body: z.object({
    emoji: z.string().min(1).max(8),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];
export type EditMessageInput = z.infer<typeof editMessageSchema>["body"];
export type ListMessagesQuery = z.infer<typeof listMessagesSchema>["query"];