import { Router } from "express";
import { downloadProjectFiles } from "../controllers/project.controllers.js";

import { authMiddleware, authorized } from "../middlewares/auth.middleware.js";

const router = Router();

// Download project files
router.get(
  "/:projectId/files/:fileId/download",
  authMiddleware,
  authorized(["Admin", "Supervisor", "Student"]),
  downloadProjectFiles,
);

export default router;
