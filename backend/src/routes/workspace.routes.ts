import { Router } from "express";
import { WorkspaceRole } from "@prisma/client";
import { workspaceController } from "../controllers/workspace.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireWorkspaceMember, requireWorkspaceRole } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import channelRoutes from "./channel.routes";
import dashboardRoutes from "./dashboard.routes";
import {
  acceptInviteSchema,
  createInviteSchema,
  createWorkspaceSchema,
  updateMemberRoleSchema,
  updateWorkspaceSchema,
} from "../validators/workspace.validator";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createWorkspaceSchema), workspaceController.create);
router.get("/", workspaceController.listMine);

router.post("/invites/:token/accept", validate(acceptInviteSchema), workspaceController.acceptInvite);

router.get("/:workspaceId", requireWorkspaceMember, workspaceController.getOne);

router.patch(
  "/:workspaceId",
  requireWorkspaceMember,
  requireWorkspaceRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate(updateWorkspaceSchema),
  workspaceController.update,
);

router.get("/:workspaceId/members", requireWorkspaceMember, workspaceController.listMembers);

router.patch(
  "/:workspaceId/members/:memberId",
  requireWorkspaceMember,
  requireWorkspaceRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate(updateMemberRoleSchema),
  workspaceController.updateMemberRole,
);

router.post(
  "/:workspaceId/invites",
  requireWorkspaceMember,
  requireWorkspaceRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate(createInviteSchema),
  workspaceController.createInvite,
);

router.use("/:workspaceId/channels", requireWorkspaceMember, channelRoutes);
router.use("/:workspaceId/dashboard", requireWorkspaceMember, dashboardRoutes);

export default router;