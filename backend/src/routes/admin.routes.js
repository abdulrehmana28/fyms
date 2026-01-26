import { Router } from "express";
import multer from "multer";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAllUsers,
  getAllProjects,
  getAllDashboardStats,
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
// Admin Routes for Teacher Management
// ----------------------

// Route to register a new Teacher
router.post(
  "/create-teacher",
  authMiddleware,
  authorized("Admin"),
  createTeacher,
);

// Route to update Teacher details
router.put(
  "/update-teacher/:id",
  authMiddleware,
  authorized("Admin"),
  updateTeacher,
);

// Route to delete a Teacher
router.delete(
  "/delete-teacher/:id",
  authMiddleware,
  authorized("Admin"),
  deleteTeacher,
);

// **********************
// Admin Routes for Project Management
// ----------------------

// Route to get all projects
router.get("/projects/", authMiddleware, authorized("Admin"), getAllProjects);

// !16:52:51

// Route to get dashboard stats
router.get(
  "/fetch-dashboard-stats/",
  authMiddleware,
  authorized("Admin"),
  getAllDashboardStats,
);

export default router;
