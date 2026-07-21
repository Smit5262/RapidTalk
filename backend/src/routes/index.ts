import { Router } from "express";
import authRoutes from "./auth.routes";
import workspaceRoutes from "./workspace.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, message: "ok", data: null, errors: null }));

router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/notifications", notificationRoutes);

// Phase 5+: router.use("/ai", aiRoutes);

export default router;