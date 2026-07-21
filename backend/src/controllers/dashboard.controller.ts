import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  overview: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.getOverview(req.params.workspaceId);
    return sendSuccess(res, data);
  }),

  activity: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.getActivity(req.params.workspaceId);
    return sendSuccess(res, data);
  }),

  recent: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.getRecent(req.params.workspaceId);
    return sendSuccess(res, data);
  }),
};
