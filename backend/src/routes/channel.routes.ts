import { Router } from "express";
import { channelController } from "../controllers/channel.controller";
import { requireWorkspaceRole } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { CHANNEL_ADMIN_ROLES } from "../services/channel.service";
import {
  channelParamsSchema,
  createChannelSchema,
  updateChannelSchema,
} from "../validators/channel.validator";

const router = Router({ mergeParams: true });

router.post("/", validate(createChannelSchema), channelController.create);
router.get("/", channelController.list);
router.get("/:channelId", validate(channelParamsSchema), channelController.getOne);

router.patch(
  "/:channelId",
  requireWorkspaceRole(...CHANNEL_ADMIN_ROLES),
  validate(updateChannelSchema),
  channelController.update,
);

router.patch(
  "/:channelId/archive",
  requireWorkspaceRole(...CHANNEL_ADMIN_ROLES),
  validate(channelParamsSchema),
  channelController.archive,
);

router.post("/:channelId/join", validate(channelParamsSchema), channelController.join);
router.post("/:channelId/leave", validate(channelParamsSchema), channelController.leave);
router.patch("/:channelId/pin", validate(channelParamsSchema), channelController.togglePin);
router.patch("/:channelId/favorite", validate(channelParamsSchema), channelController.toggleFavorite);

export default router;