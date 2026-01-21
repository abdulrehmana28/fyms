import { Router } from "express";
import multer from "multer";
import {
  getStudentProjects,
  submitProposal,
  uploadProjectFiles,
  getAvailableSupervisors,
  getSupervisor,
  requestSupervisor,
} from "../controllers/student.controllers.js";

import { authMiddleware, authorized } from "../middlewares/auth.middleware.js";
import {
  upload,
  handleUploadError,
} from "../middlewares/upload.middlewares.js";

const router = Router();

// **********************
// Student Routes
// ----------------------

// Route to get student's projects
router.get(
  "/projects",
  authMiddleware,
  authorized("Student"),
  getStudentProjects,
);

// Route to submit a project proposal
router.post(
  "/submit-proposal",
  authMiddleware,
  authorized("Student"),
  submitProposal,
);

// Route to upload files to a project
router.post(
  "/projects/upload-files/:projectId",
  authMiddleware,
  authorized("Student"),
  upload.array("files", 10), //
  handleUploadError, // Middleware to handle upload errors
  uploadProjectFiles,
);

// Route to get available supervisors
router.get(
  "/available-supervisors",
  authMiddleware,
  authorized("Student"),
  getAvailableSupervisors,
);

// Route to get assigned supervisor
router.get("/supervisor", authMiddleware, authorized("Student"), getSupervisor);

// Route to request a supervisor
router.post(
  "/request-supervisor",
  authMiddleware,
  authorized("Student"),
  requestSupervisor,
);

export default router;
