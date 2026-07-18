import { z } from "zod";
import { WorkspaceRole } from "@prisma/client";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
  }),
});

export const updateWorkspaceSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

export const createInviteSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid() }),
  body: z.object({
    email: z.string().email().optional(),
    role: z.nativeEnum(WorkspaceRole).default(WorkspaceRole.MEMBER),
    expiresInDays: z.number().int().min(1).max(30).default(7),
  }),
});

export const acceptInviteSchema = z.object({
  params: z.object({ token: z.string().min(1) }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({ workspaceId: z.string().uuid(), memberId: z.string().uuid() }),
  body: z.object({
    role: z.nativeEnum(WorkspaceRole),
  }),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>["body"];
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>["body"];
export type CreateInviteInput = z.infer<typeof createInviteSchema>["body"];