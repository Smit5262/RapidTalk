import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { channelService } from "../services/channel.service";

export const channelController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const channel = await channelService.create(req.params.workspaceId, req.workspaceMember!.id, req.body);
    return sendSuccess(res, channel, "Channel created", 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const channels = await channelService.listForMember(req.params.workspaceId, req.workspaceMember!.id);
    return sendSuccess(res, channels);
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const channel = await channelService.getOne(req.params.channelId, req.workspaceMember!.id);
    return sendSuccess(res, channel);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const channel = await channelService.update(req.params.channelId, req.body);
    return sendSuccess(res, channel, "Channel updated");
  }),

  archive: asyncHandler(async (req: Request, res: Response) => {
    const channel = await channelService.archive(req.params.channelId);
    return sendSuccess(res, channel, "Channel archived");
  }),

  join: asyncHandler(async (req: Request, res: Response) => {
    const membership = await channelService.join(req.params.channelId, req.workspaceMember!.id);
    return sendSuccess(res, membership, "Joined channel");
  }),

  leave: asyncHandler(async (req: Request, res: Response) => {
    await channelService.leave(req.params.channelId, req.workspaceMember!.id);
    return sendSuccess(res, null, "Left channel");
  }),

  togglePin: asyncHandler(async (req: Request, res: Response) => {
    const membership = await channelService.togglePin(req.params.channelId, req.workspaceMember!.id);
    return sendSuccess(res, membership, "Pin toggled");
  }),

  toggleFavorite: asyncHandler(async (req: Request, res: Response) => {
    const membership = await channelService.toggleFavorite(req.params.channelId, req.workspaceMember!.id);
    return sendSuccess(res, membership, "Favorite toggled");
  }),
};