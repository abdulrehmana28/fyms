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
  if (existingProject && existingProject.status === "Rejected") {
    await Project.findByIdAndDelete(existingProject._id);
  }

  const projectData = {
    student: studentId,
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

const uploadProjectFiles = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project || project.student?._id.toString() !== studentId.toString()) {
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
  const supervisors = await User.find({ role: "Supervisor" })
    .select("name email department expertise")
    .lean(); // .lean for better performance since we have reading only permission for data

  res.status(200).json({
    success: true,
    data: { supervisors },
    message: "Available supervisors fetched successfully",
  });
});

const getSupervisor = asyncHandler(async (req, res, next) => {
  const { studentId } = req.user._id;
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
  const { teacherId, message } = req.body;
  const studentId = req.user._id;

  const student = await User.findById(studentId);

  if (student.supervisor) {
    return next(
      new ErrorHandler("You already have a supervisor assigned", 400),
    );
  }

  const supervisor = await User.findById(teacherId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return next(new ErrorHandler("Invalid supervisor selected", 404));
  }

  if (supervisor.maxStudents === supervisor.assignedStudents.length) {
    return next(
      new ErrorHandler("Supervisor has reached maximum student capacity", 400),
    );
  }

  const requestData = {
    student: studentId,
    supervisor: teacherId,
    message,
  };

  const request = await requestService.createRequest(requestData);

  await NotificationService.notifyUser(
    teacherId,
    `${student.name} has requested you to be their supervisor.`,
    "request",
    "teacher/requests",
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
  const project = await Project.findOne({ student: studentId })
    .sort({
      createdAt: -1,
    })
    .populate("supervisor", "name")
    .lean();

  const presentDate = new Date();

  const upcomingDeadlines = await Project.find({
    student: studentId,
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

  if (!project || project.student._id.toString() !== studentId.toString()) {
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
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
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
};
