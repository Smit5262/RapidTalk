import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { messageService } from "../services/message.service";
import { emitToChannel } from "../socket/emitter";

export const messageController = {
  send: asyncHandler(async (req: Request, res: Response) => {
    const message = await messageService.send(req.params.channelId, req.user!.sub, req.body, req.params.workspaceId);
    emitToChannel(req.params.channelId, "message:new", message);
    return sendSuccess(res, message, "Message sent", 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await messageService.list(req.params.channelId, req.query as never);
    return sendSuccess(res, result);
  }),

  edit: asyncHandler(async (req: Request, res: Response) => {
    const message = await messageService.edit(req.params.messageId, req.user!.sub, req.body);
    emitToChannel(req.params.channelId, "message:updated", message);
    return sendSuccess(res, message, "Message updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await messageService.remove(req.params.messageId, req.user!.sub);
    emitToChannel(req.params.channelId, "message:deleted", { id: req.params.messageId });
    return sendSuccess(res, null, "Message deleted");
  }),

  toggleReaction: asyncHandler(async (req: Request, res: Response) => {
    const result = await messageService.toggleReaction(req.params.messageId, req.user!.sub, req.body.emoji);
    emitToChannel(req.params.channelId, "message:reaction", {
      messageId: req.params.messageId,
      userId: req.user!.sub,
      ...result,
    });
    return sendSuccess(res, result, "Reaction toggled");
  }),
};