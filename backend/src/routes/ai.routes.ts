import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { requireChannelAccess } from "../middlewares/rbac.middleware";
import { aiLimiter } from "../middlewares/rateLimit.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  extractActionItemSchema,
  meetingNotesSchema,
  rewriteSchema,
  suggestRepliesSchema,
  summarizeSchema,
  translateSchema,
} from "../validators/ai.validator";

const router = Router({ mergeParams: true });

router.use(requireChannelAccess);
router.use(aiLimiter);

router.post("/summarize", validate(summarizeSchema), aiController.summarize);
router.post("/meeting-notes", validate(meetingNotesSchema), aiController.meetingNotes);
router.post("/translate", validate(translateSchema), aiController.translate);
router.post("/rewrite", validate(rewriteSchema), aiController.rewrite);
router.post("/suggest-replies", validate(suggestRepliesSchema), aiController.suggestReplies);
router.post("/extract-action-item", validate(extractActionItemSchema), aiController.extractActionItem);

export default router;
