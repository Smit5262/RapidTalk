import { z } from "zod";

const aiParams = z.object({
  workspaceId: z.string().uuid(),
  channelId: z.string().uuid(),
});

export const summarizeSchema = z.object({
  params: aiParams,
  body: z.object({
    sinceMessageId: z.string().uuid().optional(),
  }),
});

export const meetingNotesSchema = z.object({
  params: aiParams,
  body: z.object({
    messageIds: z.array(z.string().uuid()).min(1).max(100),
  }),
});

export const translateSchema = z.object({
  params: aiParams,
  body: z.object({
    content: z.string().min(1).max(10000),
    targetLanguage: z.string().min(2).max(50),
  }),
});

export const rewriteSchema = z.object({
  params: aiParams,
  body: z.object({
    content: z.string().min(1).max(10000),
    tone: z.enum(["professional", "casual", "concise"]),
  }),
});

export const suggestRepliesSchema = z.object({
  params: aiParams,
});

export const extractActionItemSchema = z.object({
  params: aiParams,
  body: z.object({
    content: z.string().min(1).max(10000),
  }),
});
