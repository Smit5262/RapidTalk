import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  listNotificationsSchema,
  notificationIdParamSchema,
} from "../validators/notification.validator";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listNotificationsSchema), notificationController.list);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", validate(notificationIdParamSchema), notificationController.markRead);
router.post("/:id/accept", validate(notificationIdParamSchema), notificationController.acceptInvite);
router.post("/:id/decline", validate(notificationIdParamSchema), notificationController.decline);

export default router;
