import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { uploadService } from "../services/upload.service";

export const uploadController = {
  presign: asyncHandler(async (req: Request, res: Response) => {
    const result = await uploadService.presign(req.params.channelId, req.body);
    return sendSuccess(res, result, "Presigned URL created");
  }),
};
