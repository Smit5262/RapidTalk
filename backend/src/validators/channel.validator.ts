import { z } from "zod";
import { ChannelType } from "@prisma/client";

export const createChannelSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).max(80),
    type: z.nativeEnum(ChannelType).default(ChannelType.PUBLIC),
    topic: z.string().max(250).optional(),
  }),
});

export const updateChannelSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid(), channelId: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    topic: z.string().max(250).optional(),
  }),
});

export const channelParamsSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid(), channelId: z.string().uuid() }),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>["body"];
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>["body"];