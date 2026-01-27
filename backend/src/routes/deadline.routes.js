import { Router } from "express";
import { createDeadline } from "../controllers/deadline.controllers.js";

import { authMiddleware, authorized } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/create-deadline/:projectId",
  authMiddleware,
  authorized("Admin", "Teacher"),
  createDeadline,
);

export default router;
