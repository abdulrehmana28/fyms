import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../services/email.services.js";
import { ErrorHandler } from "../middlewares/error.middleware.js";
import * as userService from "../services/user.services.js";


// ************************
// Admin Controllers
// ----------------------

// *** Admin Controllers to Handle student

const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, department } = req.body;

  if (!name || !email || !password || !department) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await userService.createUser({
    name: name,
    email: email,
    password: password,
    department: department,
    role: "Student",
  });

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: { user },
  });
});

const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateStudentData = { ...req.body };
  delete updateStudentData.role; // Prevent role update

  const user = await userService.updateUser(id, updateStudentData);

  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: { user },
  });
});

const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }

  if (user.role !== "Student") {
    return next(new ErrorHandler("Cannot delete non-student users", 400));
  }

  await userService.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

// *** Admin Controllers to Handle Teacher

const createTeacher = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, maxStudents, expertise } =
    req.body;

  if (
    !name ||
    !email ||
    !password ||
    !department ||
    !maxStudents ||
    !expertise
  ) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await userService.createUser({
    name: name,
    email: email,
    password: password,
    department: department,
    maxStudents: maxStudents,
    expertise: Array.isArray(expertise)
      ? expertise
      : typeof expertise === "string" && expertise.trim() !== ""
        ? expertise.split(",").map((exp) => exp.trim())
        : [],
    role: "Teacher",
  });

  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user },
  });
});

const updateTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateTeacherData = { ...req.body };
  delete updateTeacherData.role; // Prevent role update

  const user = await userService.updateUser(id, updateTeacherData);

  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    data: { user },
  });
});

const deleteTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  if (user.role !== "Teacher") {
    return next(new ErrorHandler("Cannot delete non-teacher users", 400));
  }

  await userService.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
  });
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await userService.getAllUsers();
  console.log(users);
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: { users },
  });
});

// TODO: Implement the following admin controllers
const getAllProjects = asyncHandler(async (req, res, next) => { });

const assignSupervisorToStudent = asyncHandler(async (req, res, next) => { });

const assignProjectToStudent = asyncHandler(async (req, res, next) => { });

const getAllDashboardStats = asyncHandler(async (req, res, next) => { });

export {
  createStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAllUsers,
};
