import { z } from "zod";

export const dashboardParamsSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid() }),
});
