import { NextFunction, Request, Response } from "express";
import { WorkspaceRole } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      workspaceMember?: {
        id: string;
        workspaceId: string;
        userId: string;
        role: WorkspaceRole;
      };
    }
  }
}

/**
 * Loads the caller's WorkspaceMember row for :workspaceId and attaches it to
 * req.workspaceMember. Throws 403 if the user isn't a member at all.
 *
 * Wrapped in asyncHandler: this is an async function that throws — without
 * asyncHandler, a thrown error here becomes an unhandled Promise rejection
 * (Express 4 doesn't auto-catch async middleware errors), which crashes the
 * whole Node process instead of returning a normal error response.
 */
export const requireWorkspaceMember = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const { workspaceId } = req.params;
  const userId = req.user!.sub;

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!member) {
    throw new AppError("You are not a member of this workspace", 403);
  }

  req.workspaceMember = member;
  next();
});

/**
 * Use AFTER requireWorkspaceMember. Restricts a route to specific roles.
 * Synchronous — not affected by the async-throw crash bug, no wrapper needed.
 */
export function requireWorkspaceRole(...roles: WorkspaceRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.workspaceMember || !roles.includes(req.workspaceMember.role)) {
      throw new AppError("You don't have permission to perform this action", 403);
    }
    next();
  };
}

/**
 * Use AFTER requireWorkspaceMember on any :channelId route. Public channels
 * are open to every workspace member; private channels require an explicit
 * ChannelMember row. Throws 404 (not 403) for private channels the caller
 * can't see into.
 *
 * Wrapped in asyncHandler for the same reason as requireWorkspaceMember above.
 */
export const requireChannelAccess = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const { channelId } = req.params;

  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel || channel.isArchived) {
    throw new AppError("Channel not found", 404);
  }

  if (channel.type !== "PUBLIC") {
    const membership = await prisma.channelMember.findUnique({
      where: {
        channelId_workspaceMemberId: {
          channelId,
          workspaceMemberId: req.workspaceMember!.id,
        },
      },
    });
    if (!membership) {
      throw new AppError("Channel not found", 404);
    }
  }

  req.channel = channel;
  next();
});

declare global {
  namespace Express {
    interface Request {
      channel?: { id: string; workspaceId: string; type: string; isArchived: boolean };
    }
  }
}