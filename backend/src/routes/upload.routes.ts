import { Router } from "express";
import { uploadController } from "../controllers/upload.controller";
import { requireChannelAccess } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { presignUploadSchema } from "../validators/upload.validator";

const router = Router({ mergeParams: true });

router.post(
  "/presign",
  requireChannelAccess,
  validate(presignUploadSchema),
  uploadController.presign,
);

export default router;
