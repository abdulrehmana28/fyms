import { Router } from "express";
import {
  getSupervisorDashboardStats,
  getRequests,
  acceptRequest,
  rejectRequest,
  getAssignedStudents,
  markProjectAsCompleted,
  addFeedbackToProject,
  downloadStudentProjectFiles,
  getStudentProjectFiles,
} from "../controllers/supervisor.controllers.js";
import { authMiddleware, authorized } from "../middlewares/auth.middleware.js";

const router = Router();

// **********************
// Supervisor Routes
// ----------------------

// Route to get supervisor's dashboard stats
router.get(
  "/fetch-dashboard-stats",
  authMiddleware,
  authorized("Supervisor"),
  getSupervisorDashboardStats,
);

// Route to get supervisor's request
router.get("/requests", authMiddleware, authorized("Supervisor"), getRequests);

// Route to accept a request
router.post(
  "/requests/accept/:requestId",
  authMiddleware,
  authorized("Supervisor"),
  acceptRequest,
);

// Route to reject a request
router.post(
  "/requests/reject/:requestId",
  authMiddleware,
  authorized("Supervisor"),
  rejectRequest,
);

// Route to add feedback to a project
router.post(
  "/feedback/:projectId/",
  authMiddleware,
  authorized("Supervisor"),
  addFeedbackToProject,
);

// Route to mark a project as completed
router.post(
  "/mark-project-completed/:projectId",
  authMiddleware,
  authorized("Supervisor"),
  markProjectAsCompleted,
);

// Router to get assigned students
router.get(
  "/assigned-students",
  authMiddleware,
  authorized("Supervisor"),
  getAssignedStudents,
);

// Route to download project files
router.get(
  "/projects/download/:projectId/:fileId",
  authMiddleware,
  authorized("Supervisor"),
  downloadStudentProjectFiles,
);

// Route to get student project files
router.get(
  "/project/files",
  authMiddleware,
  authorized("Supervisor"),
  getStudentProjectFiles,
);

export default router;
