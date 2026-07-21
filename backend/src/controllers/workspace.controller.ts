import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { workspaceService } from "../services/workspace.service";
import { userRepository } from "../repositories/auth.repository";

export const workspaceController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const workspace = await workspaceService.create(req.user!.sub, req.body);
    return sendSuccess(res, workspace, "Workspace created", 201);
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const workspaces = await workspaceService.listMine(req.user!.sub);
    return sendSuccess(res, workspaces);
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const workspace = await workspaceService.getById(req.params.workspaceId);
    return sendSuccess(res, workspace);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const workspace = await workspaceService.update(req.params.workspaceId, req.body);
    return sendSuccess(res, workspace, "Workspace updated");
  }),

  listMembers: asyncHandler(async (req: Request, res: Response) => {
    const members = await workspaceService.listMembers(req.params.workspaceId);
    return sendSuccess(res, members);
  }),

  updateMemberRole: asyncHandler(async (req: Request, res: Response) => {
    const member = await workspaceService.updateMemberRole(
      req.params.workspaceId,
      req.params.memberId,
      req.body.role,
      req.workspaceMember!.role,
    );
    return sendSuccess(res, member, "Member role updated");
  }),

  createInvite: asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.findById(req.user!.sub);
    const invite = await workspaceService.createInvite(req.params.workspaceId, req.body, user?.name ?? "Someone");
    return sendSuccess(res, invite, "Invite created", 201);
  }),

  acceptInvite: asyncHandler(async (req: Request, res: Response) => {
    const member = await workspaceService.acceptInvite(req.params.token, req.user!.sub);
    return sendSuccess(res, member, "Joined workspace");
  }),
};