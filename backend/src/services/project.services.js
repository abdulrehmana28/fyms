import crypto from "crypto";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import { ErrorHandler } from "../middlewares/error.middleware.js";
import { INVITE_CODE_EXPIRY_HOURS } from "../utils/constants.js";

const getProjectsByStudentId = async (studentId) => {
  return await Project.findOne({ members: studentId }).sort({ createdAt: -1 });
};

const createProject = async (projectData) => {
  const project = new Project(projectData);
  await project.save();
  return project;
};

const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("members", "name email")
    .populate("createdBy", "name email")
    .populate("supervisor", "name email")
    .populate("feedback.supervisorId", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  return project;
};

const getAllProjects = async (filter = {}) => {
  const projects = await Project.find(filter)
    .populate("members", "name email")
    .populate("createdBy", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  if (!projects) {
    throw new ErrorHandler("No projects found", 404);
  }
  return projects;
};

const addFilesToProject = async (projectId, files) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  const fileMetaData = files.map((file) => ({
    fileType: file.mimetype,
    fileUrl: file.path,
    originalName: file.originalname,
    uploadedAt: new Date(),
  }));

  project.files.push(...fileMetaData);
  await project.save();
  return project;
};

const markComplete = async (projectId) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { status: "Completed" },
    { new: true, runValidators: true },
  )
    .populate("members", "name email")
    .populate("createdBy", "name email")
    .populate("supervisor", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  return project;
};

const addFeedback = async (projectId, supervisorId, type, title, message) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  // Healing/Migration Logic: Ensure all existing feedback follows the new flat schema
  project.feedback = project.feedback.map((f) => {
    if (f.feedback && Array.isArray(f.feedback) && f.feedback.length > 0) {
      const inner = f.feedback[0];
      return {
        supervisorId: inner.supervisorId,
        type: inner.type,
        title: inner.title,
        message: inner.message,
        createdAt: f.createdAt,
      };
    }
    return f;
  });

  project.feedback = project.feedback.filter(
    (f) => f.supervisorId && f.title && f.message,
  );

  project.feedback.push({
    supervisorId,
    type,
    title,
    message,
  });

  await project.save();

  const latestFeedback = project.feedback[project.feedback.length - 1];
  return { project, latestFeedback };
};

const getProjectsBySupervisor = async (supervisorId) => {
  return await getAllProjects({ supervisor: supervisorId });
};

const updateProject = async (projectId, updateData) => {
  const project = await Project.findByIdAndUpdate(projectId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("members", "name email")
    .populate("createdBy", "name email")
    .populate("supervisor", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  return project;
};

// --------------- Group / Invite helpers ---------------

/**
 * Check whether a user is a member of a project.
 */
const isProjectMember = (project, userId) => {
  return project.members.some(
    (m) => (m._id || m).toString() === userId.toString(),
  );
};

/**
 * Generate an 8-char hex invite code for the project.
 * Only the project creator (leader) can generate.
 */
const generateInviteCode = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ErrorHandler("Project not found", 404);

  if (project.createdBy.toString() !== userId.toString()) {
    throw new ErrorHandler(
      "Only the group leader can generate an invite code",
      403,
    );
  }

  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  project.inviteCode = code;
  project.inviteCodeExpiresAt = new Date(
    Date.now() + INVITE_CODE_EXPIRY_HOURS * 60 * 60 * 1000,
  );
  await project.save();
  return { inviteCode: code, expiresAt: project.inviteCodeExpiresAt };
};

/**
 * Join a project/group using an invite code.
 */
const joinProjectByCode = async (inviteCode, studentId) => {
  const project = await Project.findOne({
    inviteCode,
    inviteCodeExpiresAt: { $gt: new Date() },
  });

  if (!project) {
    throw new ErrorHandler("Invalid or expired invite code", 400);
  }

  // Ensure student doesn't already belong to a project
  const student = await User.findById(studentId);
  if (!student) throw new ErrorHandler("Student not found", 404);

  if (student.project) {
    throw new ErrorHandler(
      "You already belong to a project. Leave your current project first.",
      400,
    );
  }

  if (project.members.length >= project.maxMembers) {
    throw new ErrorHandler("This group is already full", 400);
  }

  // Check for duplicate membership
  if (isProjectMember(project, studentId)) {
    throw new ErrorHandler("You are already a member of this group", 400);
  }

  // Add student to group
  project.members.push(studentId);
  // Clear invite code after use
  project.inviteCode = null;
  project.inviteCodeExpiresAt = null;
  await project.save();

  // Keep User.project consistent
  student.project = project._id;
  // If the project already has a supervisor, assign it to the joining student
  if (project.supervisor) {
    student.supervisor = project.supervisor;
  }
  await student.save();

  return project;
};

/**
 * Admin override — add any student to a project, bypassing maxMembers.
 */
const addMemberToProject = async (projectId, studentId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ErrorHandler("Project not found", 404);

  const student = await User.findById(studentId);
  if (!student) throw new ErrorHandler("Student not found", 404);

  if (student.project) {
    throw new ErrorHandler("Student already belongs to a project", 400);
  }

  if (isProjectMember(project, studentId)) {
    throw new ErrorHandler("Student is already a member of this group", 400);
  }

  project.members.push(studentId);
  await project.save();

  student.project = project._id;
  if (project.supervisor) {
    student.supervisor = project.supervisor;
  }
  await student.save();

  return project;
};

export {
  getProjectsByStudentId,
  createProject,
  getProjectById,
  addFilesToProject,
  getAllProjects,
  markComplete,
  addFeedback,
  getProjectsBySupervisor,
  updateProject,
  isProjectMember,
  generateInviteCode,
  joinProjectByCode,
  addMemberToProject,
};
