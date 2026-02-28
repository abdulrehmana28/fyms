import { Router } from "express";
import multer from "multer";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  getAllUsers,
  getAllProjects,
  getAllDashboardStats,
  assignSupervisorToStudent,
  getProject,
  updateProjectStatus,
} from "../controllers/admin.controllers.js";

import { authMiddleware, authorized } from "../middlewares/auth.middleware.js";

const router = Router();

// **********************
// Admin Routes for Student Management
// ----------------------

// get all users
router.get("/users", authMiddleware, authorized("Admin"), getAllUsers);

// Route to register a new student
router.post(
  "/create-student",
  authMiddleware,
  authorized("Admin"),
  createStudent,
);

// Route to update student details
router.put(
  "/update-student/:id",
  authMiddleware,
  authorized("Admin"),
  updateStudent,
);

// Route to delete a student
router.delete(
  "/delete-student/:id",
  authMiddleware,
  authorized("Admin"),
  deleteStudent,
);

// **********************
// Admin Routes for Supervisor Management
// ----------------------

// Route to register a new Supervisor
router.post(
  "/create-supervisor",
  authMiddleware,
  authorized("Admin"),
  createSupervisor,
);

// Route to update Supervisor details
router.put(
  "/update-supervisor/:id",
  authMiddleware,
  authorized("Admin"),
  updateSupervisor,
);

// Route to delete a Supervisor
router.delete(
  "/delete-supervisor/:id",
  authMiddleware,
  authorized("Admin"),
  deleteSupervisor,
);

// **********************
// Admin Routes for Project Management
// ----------------------

// Route to get all projects
router.get("/projects/", authMiddleware, authorized("Admin"), getAllProjects);

// Route to get dashboard stats
router.get(
  "/fetch-dashboard-stats/",
  authMiddleware,
  authorized("Admin"),
  getAllDashboardStats,
);

// Route to assign supervisor to student
router.post(
  "/assign-supervisor",
  authMiddleware,
  authorized("Admin"),
  assignSupervisorToStudent,
);

// Route to update project status
router.put(
  "/project/:id",
  authMiddleware,
  authorized("Admin"),
  updateProjectStatus,
);

// Route to get a specific project
router.get("/project/:id", authMiddleware, authorized("Admin"), getProject);

export default router;
