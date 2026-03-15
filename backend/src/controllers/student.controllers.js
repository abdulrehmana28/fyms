import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../services/email.services.js";
import { ErrorHandler } from "../middlewares/error.middleware.js";
import * as userService from "../services/user.services.js";
import * as projectService from "../services/project.services.js";
import * as requestService from "../services/request.services.js";
import * as NotificationService from "../services/notification.services.js";
import * as fileService from "../services/file.services.js";
import { Project } from "../models/project.models.js";
import { Notification } from "../models/notification.models.js";
import { UserRoleEnums } from "../utils/constants.js";

const getStudentProjects = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const project = await projectService.getProjectsByStudentId(studentId);

  if (!project) {
    return res.status(200).json({
      success: true,
      data: { project: null },
      message: "No project found for this Student",
    });
  }

  // Populate members for the response
  await project.populate("members", "name email");
  await project.populate("createdBy", "name email");

  res.status(200).json({
    success: true,
    data: { project },
  });
});

const submitProposal = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const { title, description } = req.body;

  // Check if the student already has a project
  const existingProject =
    await projectService.getProjectsByStudentId(studentId);
  // TODO: Use enum from utils/constants.js
  if (existingProject && existingProject.status !== "Rejected") {
    return next(
      new ErrorHandler(
        "You have already submitted a project proposal. Please wait for the current proposal to be reviewed or contact support for further assistance.",
        400,
      ),
    );
  }

  // If the existing project is rejected, delete it before creating a new one
  // Keep group intact — only the leader can resubmit
  if (existingProject && existingProject.status === "Rejected") {
    if (existingProject.createdBy.toString() !== studentId.toString()) {
      return next(
        new ErrorHandler(
          "Only the group leader can resubmit a rejected proposal",
          403,
        ),
      );
    }
    // Preserve group members for the new project
    const existingMembers = existingProject.members.map((m) =>
      (m._id || m).toString(),
    );
    await Project.findByIdAndDelete(existingProject._id);

    // Clear project ref on all members
    await User.updateMany(
      { _id: { $in: existingMembers } },
      { $set: { project: null } },
    );
  }

  const projectData = {
    createdBy: studentId,
    members: [studentId],
    title,
    description,
  };

  const newProject = await projectService.createProject(projectData);

  await User.findByIdAndUpdate(studentId, { project: newProject._id });

  res.status(201).json({
    success: true,
    data: { project: newProject },
    message: "Project proposal submitted successfully",
  });
});

import { isFileSystemAvailable } from "../utils/fsAvailability.js";

const uploadProjectFiles = asyncHandler(async (req, res, next) => {
  // fail early if the filesystem isn’t writable; avoids confusing multer errors
  if (!isFileSystemAvailable()) {
    return res.status(503).json({
      success: false,
      message: "File system unavailable. Uploads are temporarily disabled.",
    });
  }

  const { projectId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project || !projectService.isProjectMember(project, studentId)) {
    return next(
      new ErrorHandler(
        "Project not found or you do not have permission to upload files to this project",
        404,
      ),
    );
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
  }

  const updatedProject = await projectService.addFilesToProject(
    projectId,
    req.files,
  );

  res.status(200).json({
    success: true,
    data: { project: updatedProject },
    message: "Files uploaded successfully",
  });
});

const getAvailableSupervisors = asyncHandler(async (req, res, next) => {
  const supervisors = await User.find({ role: UserRoleEnums.SUPERVISOR })
    .select("name email department expertise")
    .lean(); // .lean for better performance since we have reading only permission for data

  res.status(200).json({
    success: true,
    data: { supervisors },
    message: "Available supervisors fetched successfully",
  });
});

const getSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department expertise",
  );

  if (!student?.supervisor) {
    return next(
      new ErrorHandler("No supervisor assigned to this student", 404),
    );
  }

  res.status(200).json({
    success: true,
    data: { supervisor: student?.supervisor },
    message: "Supervisor details fetched successfully",
  });
});

const requestSupervisor = asyncHandler(async (req, res, next) => {
  const { supervisorId, message } = req.body;
  const studentId = req.user._id;

  const student = await User.findById(studentId);

  if (student.supervisor) {
    return next(
      new ErrorHandler("You already have a supervisor assigned", 400),
    );
  }

  // Only the group leader can request a supervisor
  const project = await projectService.getProjectsByStudentId(studentId);
  if (project && project.createdBy.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler("Only the group leader can request a supervisor", 403),
    );
  }

  // Populate members for group context
  if (project) {
    await project.populate("members", "name");
  }

  const supervisor = await User.findById(supervisorId);
  if (!supervisor || supervisor.role !== UserRoleEnums.SUPERVISOR) {
    return next(new ErrorHandler("Invalid supervisor selected", 404));
  }

  if (supervisor.maxStudents === supervisor.assignedStudents.length) {
    return next(
      new ErrorHandler("Supervisor has reached maximum student capacity", 400),
    );
  }

  const memberNames =
    project?.members?.map((m) => m.name).join(", ") || student.name;
  const groupInfo = `(Group: ${memberNames})`;

  const requestData = {
    student: studentId,
    supervisor: supervisorId,
    message: `${groupInfo} ${message || ""}`.trim().substring(0, 250),
  };

  const request = await requestService.createRequest(requestData);

  await NotificationService.notifyUser(
    supervisorId,
    `${student.name} ${groupInfo} has requested ${supervisor.name} to be their supervisor.`,
    "Request",
    "supervisor/requests",
    "Medium",
  );

  res.status(201).json({
    success: true,
    data: { request },
    message: "Supervisor request submitted successfully",
  });
});

const getDashBoardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const project = await Project.findOne({ members: studentId })
    .sort({
      createdAt: -1,
    })
    .populate("supervisor", "name")
    .populate("members", "name email")
    .populate("createdBy", "name email")
    .lean();

  const presentDate = new Date();

  const upcomingDeadlines = await Project.find({
    members: studentId,
    deadlines: { $gte: presentDate },
  })
    .select("title description")
    .sort({
      deadlines: 1,
    })
    .limit(3)
    .lean();

  const topNotifications = await Notification.find({ user: studentId })
    .populate("user", "name")
    .sort({
      createdAt: -1,
    })
    .limit(3)
    .lean();

  const feedbackNotifications =
    project?.feedback && project?.feedback.length > 0
      ? [...project.feedback]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
      : [];

  const supervisorName = project?.supervisor?.name || null;

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      project,
      upcomingDeadlines,
      topNotifications,
      feedbackNotifications,
      supervisorName,
    },
  });
});

const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project || !projectService.isProjectMember(project, studentId)) {
    return next(
      new ErrorHandler(
        "Project not found or you do not have permission to view feedback for this project",
        404,
      ),
    );
  }

  const sortedFeedback = project.feedback
    .sort(
      (feedback1, feedback2) =>
        new Date(feedback2.createdAt) - new Date(feedback1.createdAt),
    )
    .map((feedback) => ({
      _id: feedback._id,
      title: feedback.title,
      message: feedback.message,
      type: feedback.type,
      supervisorName: feedback.supervisorId?.name,
      supervisorEmail: feedback.supervisorId?.email,
      createdAt: feedback.createdAt,
    }));

  res.status(200).json({
    success: true,
    data: { feedback: sortedFeedback },
  });
});

const downloadProjectFiles = asyncHandler(async (req, res, next) => {
  if (!isFileSystemAvailable()) {
    return res.status(503).json({
      success: false,
      message: "File system unavailable. Cannot download files at this time.",
    });
  }

  const { projectId, fileId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project || !projectService.isProjectMember(project, studentId)) {
    return next(
      new ErrorHandler(
        "Project not found or you do not have permission to download files from this project",
        404,
      ),
    );
  }

  const file = project.files.id(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  fileService.streamDownload(file.fileUrl, res, file.originalName);
});

// --------------- Group / Invite endpoints ---------------

const generateInviteCode = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const project = await projectService.getProjectsByStudentId(studentId);

  if (!project) {
    return next(new ErrorHandler("You must have a project first", 400));
  }

  const result = await projectService.generateInviteCode(
    project._id,
    studentId,
  );

  res.status(200).json({
    success: true,
    data: result,
    message: "Invite code generated successfully",
  });
});

const joinGroup = asyncHandler(async (req, res, next) => {
  const { inviteCode } = req.body;
  const studentId = req.user._id;

  if (!inviteCode) {
    return next(new ErrorHandler("Invite code is required", 400));
  }

  const project = await projectService.joinProjectByCode(
    inviteCode.toUpperCase(),
    studentId,
  );

  // Notify the group leader
  await NotificationService.notifyUser(
    project.createdBy,
    `${req.user.name} has joined your group for project "${project.title}".`,
    "Success",
    "/student/dashboard",
    "Medium",
  );

  await project.populate("members", "name email");
  await project.populate("createdBy", "name email");

  res.status(200).json({
    success: true,
    data: { project },
    message: "Successfully joined the group",
  });
});

export {
  getStudentProjects,
  submitProposal,
  uploadProjectFiles,
  getAvailableSupervisors,
  getSupervisor,
  requestSupervisor,
  getDashBoardStats,
  getFeedback,
  downloadProjectFiles,
  generateInviteCode,
  joinGroup,
};
