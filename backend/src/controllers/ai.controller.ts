import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { aiService } from "../services/ai/ai.service";

export const aiController = {
  summarize: asyncHandler(async (req: Request, res: Response) => {
    const summary = await aiService.summarizeChannel(
      req.params.channelId,
      req.body.sinceMessageId,
      req.user!.sub,
    );
    return sendSuccess(res, { summary });
  }),

  meetingNotes: asyncHandler(async (req: Request, res: Response) => {
    const notes = await aiService.generateMeetingNotes(
      req.params.channelId,
      req.body.messageIds,
      req.user!.sub,
    );
    return sendSuccess(res, { notes });
  }),

  translate: asyncHandler(async (req: Request, res: Response) => {
    const translation = await aiService.translateMessage(
      req.body.content,
      req.body.targetLanguage,
      req.user!.sub,
    );
    return sendSuccess(res, { translation });
  }),

  rewrite: asyncHandler(async (req: Request, res: Response) => {
    const rewritten = await aiService.rewriteMessage(
      req.body.content,
      req.body.tone,
      req.user!.sub,
    );
    return sendSuccess(res, { rewritten });
  }),

  suggestReplies: asyncHandler(async (req: Request, res: Response) => {
    const suggestions = await aiService.suggestReplies(req.params.channelId, req.user!.sub);
    return sendSuccess(res, { suggestions });
  }),

  extractActionItem: asyncHandler(async (req: Request, res: Response) => {
    const tasks = await aiService.extractActionItems(req.body.content, req.user!.sub);
    return sendSuccess(res, tasks);
  }),
};
