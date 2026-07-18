import { NextFunction, Request, Response } from "express";
import { WorkspaceRole } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/database";

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

export async function requireWorkspaceMember(req: Request, _res: Response, next: NextFunction) {
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
}

export function requireWorkspaceRole(...roles: WorkspaceRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.workspaceMember || !roles.includes(req.workspaceMember.role)) {
      throw new AppError("You don't have permission to perform this action", 403);
    }
    next();
  };
}