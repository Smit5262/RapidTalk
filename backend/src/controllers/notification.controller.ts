import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { notificationService } from "../services/notification.service";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.list(req.user!.sub, req.query as never);
    return sendSuccess(res, result);
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(req.params.id, req.user!.sub);
    return sendSuccess(res, notification, "Notification marked as read");
  }),

  acceptInvite: asyncHandler(async (req: Request, res: Response) => {
    const member = await notificationService.acceptInvite(req.params.id, req.user!.sub);
    return sendSuccess(res, member, "Invite accepted");
  }),

  decline: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.decline(req.params.id, req.user!.sub);
    return sendSuccess(res, notification, "Invite declined");
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.user!.sub);
    return sendSuccess(res, null, "All notifications marked as read");
  }),
};
