import { Router } from "express";
import {
  getTeacherDashboardStats,
  getRequests,
  acceptRequest,
  rejectRequest,
  getAssignedStudents,
  markProjectAsCompleted,
  addFeedbackToProject,
  downloadStudentProjectFiles,
  getStudentProjectFiles,
} from "../controllers/teacher.controllers.js";
import { authMiddleware, authorized } from "../middlewares/auth.middleware.js";

const router = Router();

// **********************
// Teacher Routes
// ----------------------

// Route to get teacher's dashboard stats
router.get(
  "/fetch-dashboard-stats",
  authMiddleware,
  authorized("Teacher"),
  getTeacherDashboardStats,
);

// Route to get teacher's request
router.get("/requests", authMiddleware, authorized("Teacher"), getRequests);

// Route to accept a request
router.post(
  "/requests/accept/:requestId",
  authMiddleware,
  authorized("Teacher"),
  acceptRequest,
);

// Route to reject a request
router.post(
  "/requests/reject/:requestId",
  authMiddleware,
  authorized("Teacher"),
  rejectRequest,
);

// Route to add feedback to a project
router.post(
  "/feedback/:projectId/",
  authMiddleware,
  authorized("Teacher"),
  addFeedbackToProject,
);

// Route to mark a project as completed
router.post(
  "/mark-project-completed/:projectId",
  authMiddleware,
  authorized("Teacher"),
  markProjectAsCompleted,
);

// Router to get assigned students
router.get(
  "/assigned-students",
  authMiddleware,
  authorized("Teacher"),
  getAssignedStudents,
);

// Route to download project files
router.get(
  "/projects/download/:projectId/:fileId",
  authMiddleware,
  authorized("Teacher"),
  downloadStudentProjectFiles,
);

// Route to get student project files
router.get(
  "/project/files",
  authMiddleware,
  authorized("Teacher"),
  getStudentProjectFiles,
);

export default router;
