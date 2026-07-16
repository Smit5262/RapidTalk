import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, message: "ok", data: null, errors: null }));

router.use("/auth", authRoutes);

// Phase 2+: router.use("/workspaces", workspaceRoutes);
// Phase 2+: router.use("/channels", channelRoutes);
// Phase 3+: router.use("/messages", messageRoutes);
// Phase 5+: router.use("/ai", aiRoutes);

export default router;