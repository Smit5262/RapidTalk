import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { requireWorkspaceMember } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { dashboardParamsSchema } from "../validators/dashboard.validator";

const router = Router({ mergeParams: true });

router.use(requireWorkspaceMember);

router.get("/overview", validate(dashboardParamsSchema), dashboardController.overview);
router.get("/activity", validate(dashboardParamsSchema), dashboardController.activity);
router.get("/recent", validate(dashboardParamsSchema), dashboardController.recent);

export default router;
