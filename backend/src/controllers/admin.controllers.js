import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { SupervisorRequest } from "../models/supervisorRequest.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../services/email.services.js";
import { ErrorHandler } from "../middlewares/error.middleware.js";
import * as userService from "../services/user.services.js";
import * as projectService from "../services/project.services.js";
import * as NotificationService from "../services/notification.services.js";

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

// *** Admin Controllers to Handle Supervisor

const createSupervisor = asyncHandler(async (req, res, next) => {
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
    role: "Supervisor",
  });

  res.status(201).json({
    success: true,
    message: "Supervisor created successfully",
    data: { user },
  });
});

const updateSupervisor = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateSupervisorData = { ...req.body };
  delete updateSupervisorData.role; // Prevent role update

  // ensure the existing user is a supervisor before making updates
  const existingUser = await userService.getUserById(id);
  if (!existingUser || existingUser.role !== "Supervisor") {
    return next(new ErrorHandler("Supervisor not found", 404));
  }

  const user = await userService.updateUser(id, updateSupervisorData);

  if (!user) {
    // should be unreachable but keep the check just in case
    return next(new ErrorHandler("Supervisor not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Supervisor updated successfully",
    data: { user },
  });
});

const deleteSupervisor = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  if (!user) {
    return next(new ErrorHandler("Supervisor not found", 404));
  }

  if (user.role !== "Supervisor") {
    return next(new ErrorHandler("Cannot delete non-supervisor users", 400));
  }

  await userService.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Supervisor deleted successfully",
  });
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: { users },
  });
});

const getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await projectService.getAllProjects();

  res.status(200).json({
    success: true,
    data: { projects },
    message: "Projects retrieved successfully",
  });
});

// TODO: Implement the following admin controllers
// Admin Dashboard Controllers

const assignSupervisorToStudent = asyncHandler(async (req, res, next) => {
  const { studentId, supervisorId, projectId } = req.body;

  if ((!studentId && !projectId) || !supervisorId) {
    return next(
      new ErrorHandler(
        "supervisorId and either studentId or projectId are required to assign a supervisor.",
        400,
      ),
    );
  }

  const supervisorUser = await userService.getUserById(supervisorId);

  if (!supervisorUser) {
    return next(
      new ErrorHandler("supervisorId must be a valid Supervisor", 400),
    );
  }

  if (supervisorUser.role !== "Supervisor") {
    return next(
      new ErrorHandler("supervisorId must be a valid Supervisor", 400),
    );
  }

  // Look up the project by projectId or by the student's membership
  let project;
  if (projectId) {
    project = await Project.findById(projectId);
  } else {
    project = await Project.findOne({ members: studentId });
  }

  if (!project) {
    return next(
      new ErrorHandler("No project found for the given student/project.", 404),
    );
  }

  if (project.supervisor !== null) {
    return next(
      new ErrorHandler(
        "Supervisor has already been assigned to this project.",
        400,
      ),
    );
  }

  if (project.status !== "Approved") {
    return next(
      new ErrorHandler(
        "Cannot assign supervisor to a project that is not approved.",
        400,
      ),
    );
  }

  // Use group-aware assignment
  const { project: updatedProject, supervisor } =
    await userService.assignSupervisorToProject(project._id, supervisorId);

  await NotificationService.notifyProjectMembers(
    project._id,
    `${supervisor.name} has been assigned as supervisor for your project.`,
    "Success",
    "/student/status",
    "High",
  );

  await NotificationService.notifyUser(
    supervisorId,
    `${supervisor.name} has been assigned as supervisor for a project.`,
    "Success",
    "/supervisor/students",
    "High",
  );

  res.status(200).json({
    success: true,
    data: { project: updatedProject, supervisor },
    message: "Supervisor assigned successfully",
  });
});

const getAllDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalStudents,
    totalSupervisors,
    totalProjects,
    pendingRequests,
    completedProjects,
    pendingProjects,
  ] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Supervisor" }),
    Project.countDocuments(),
    SupervisorRequest.countDocuments({ status: "Pending" }),
    Project.countDocuments({ status: "Completed" }),
    Project.countDocuments({ status: "Pending" }),
  ]);

  res.status(200).json({
    success: true,
    message: "Admin Dashboard stats retrieved successfully",
    data: {
      totalStudents,
      totalSupervisors,
      totalProjects,
      pendingRequests,
      completedProjects,
      pendingProjects,
    },
  });
});

const getProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await projectService.getProjectById(id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const user = req.user;
  const userRole = (user.role || "").toLowerCase();
  const userId = user._id?.toString() || user.id;

  const hasAccess =
    userRole === "admin" ||
    project.createdBy._id.toString() === userId ||
    project.members.some((m) => (m._id || m).toString() === userId) ||
    (project.supervisor && project.supervisor._id.toString() === userId);

  if (!hasAccess) {
    return next(new ErrorHandler("Not authorized to fetch projects", 403));
  }

  return res.status(200).json({
    success: true,
    data: { project },
  });
});

const updateProjectStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updatedData = req.body;

  const project = await projectService.getProjectById(id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const user = req.user;
  const userRole = (user.role || "").toLowerCase();
  const userId = user._id?.toString() || user.id;

  const hasAccess =
    userRole === "admin" ||
    project.createdBy._id.toString() === userId ||
    project.members.some((m) => (m._id || m).toString() === userId) ||
    (project.supervisor && project.supervisor._id.toString() === userId);

  if (!hasAccess) {
    return next(
      new ErrorHandler("Not authorized to update project status", 403),
    );
  }

  const updatedProject = await projectService.updateProject(id, updatedData);

  return res.status(200).json({
    success: true,
    data: { project: updatedProject },
    message: "Project status updated successfully",
  });
});

// Admin override — add a student to a project group, bypassing maxMembers
const addMemberToProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return next(new ErrorHandler("studentId is required", 400));
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== "Student") {
    return next(new ErrorHandler("Invalid student ID", 400));
  }

  const project = await projectService.addMemberToProject(projectId, studentId);

  await project.populate("members", "name email");
  await project.populate("createdBy", "name email");

  // Notify the new member
  await NotificationService.notifyUser(
    studentId,
    `You have been added to the project "${project.title}" by an administrator.`,
    "Success",
    "/student/dashboard",
    "High",
  );

  // Notify existing members
  await NotificationService.notifyProjectMembers(
    project._id,
    `${student.name} has been added to your group by an administrator.`,
    "Info",
    "/student/dashboard",
    "Medium",
  );

  res.status(200).json({
    success: true,
    data: { project },
    message: "Member added to project successfully",
  });
});

export {
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
  addMemberToProject,
};
