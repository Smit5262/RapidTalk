import { Router } from "express";
import { messageController } from "../controllers/message.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  editMessageSchema,
  listMessagesSchema,
  messageParamsSchema,
  reactSchema,
  sendMessageSchema,
} from "../validators/message.validator";

const router = Router({ mergeParams: true });

router.get("/", validate(listMessagesSchema), messageController.list);
router.post("/", validate(sendMessageSchema), messageController.send);
router.patch("/:messageId", validate(editMessageSchema), messageController.edit);
router.delete("/:messageId", validate(messageParamsSchema), messageController.remove);
router.post("/:messageId/reactions", validate(reactSchema), messageController.toggleReaction);

export default router;