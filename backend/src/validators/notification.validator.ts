import { z } from "zod";

export const listNotificationsSchema = z.object({
  query: z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsSchema>["query"];
