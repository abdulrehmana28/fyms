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
import * as notificationService from "../services/notification.services.js";
import * as fileService from "../services/file.services.js";
import { Project } from "../models/project.models.js";
import { Notification } from "../models/notification.models.js";
import { SupervisorRequest } from "../models/supervisorRequest.models.js";
import {
  generateRequestAcceptanceTemplate,
  generateRequestRejectionTemplate,
} from "../utils/emailTemplates.js";

const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const totalPendingRequests = await SupervisorRequest.countDocuments({
    teacher: teacherId,
    status: "Pending",
  });

  const completedProjects = await Project.countDocuments({
    supervisor: teacherId,
    status: "Completed",
  });

  const recentNotifications = await Notification.find({ user: teacherId })
    .sort({ createdAt: -1 })
    .limit(5);

  const dashboardStats = {
    totalPendingRequests,
    completedProjects,
    recentNotifications,
  };

  res.status(200).json({
    success: true,
    message: "Teacher dashboard stats fetched successfully",
    data: { dashboardStats },
  });
});

const getRequests = asyncHandler(async (req, res, next) => {
  const { supervisor } = req.query;

  const filters = {};
  if (supervisor) filters.supervisor = supervisor;

  const { requests, total } = await requestService.getAllRequests(filters);

  const updatedRequests = await Promise.all(
    requests.map(async (reqObj) => {
      const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;
      if (requestObj?.student?._id) {
        const latestProject = await Project.findOne({
          student: requestObj.student._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return { ...requestObj, latestProject };
      }
      return requestObj;
    }),
  );

  res.status(200).json({
    success: true,
    message: "Requests fetched successfully",
    data: { requests: updatedRequests, total },
  });
});

const acceptRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestService.acceptRequestById(requestId, teacherId);

  if (!request) {
    return next(
      new ErrorHandler("Request not found or already processed", 404),
    );
  }

  await notificationService.notifyUser(
    request.student._id,
    `Your request has been accepted by ${req.user.name}.`,
    "Approval",
    "/students/status",
    "High",
  );

  const student = await User.findById(request.student._id);
  const studentEmail = student.email;
  const message = generateRequestAcceptanceTemplate(req.user.name);

  await sendEmail({
    to: studentEmail,
    subject: "CapTrak - Request Accepted",
    message,
  });

  res.status(200).json({
    success: true,
    message: "Request accepted successfully",
    data: { request },
  });
});

const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestService.rejectRequestById(requestId, teacherId);

  if (!request) {
    return next(
      new ErrorHandler("Request not found or already processed", 404),
    );
  }

  await notificationService.notifyUser(
    request.student._id,
    `Your request has been rejected by ${req.user.name}.`,
    "Rejection",
    "/students/status",
    "High",
  );

  const student = await User.findById(request.student._id);
  const studentEmail = student.email;
  const message = generateRequestRejectionTemplate(req.user.name);

  await sendEmail({
    to: studentEmail,
    subject: "CapTrak - Request Rejected",
    message,
  });

  res.status(200).json({
    success: true,
    message: "Request rejected successfully",
    data: { request },
  });
});

const getAssignedStudents = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;
  const students = await User.find({ supervisor: teacherId })
    .populate("project")
    .sort({ createdAt: -1 });

  const total = await User.countDocuments({ supervisor: teacherId });

  res.status(200).json({
    success: true,
    message: "Assigned students fetched successfully",
    data: { students, total },
  });
});

const markProjectAsCompleted = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor.toString() !== teacherId.toString()) {
    return next(
      new ErrorHandler("You are not authorized to complete this project", 403),
    );
  }

  const updatedProject = await projectService.markComplete(projectId);

  await notificationService.notifyUser(
    project.student._id,
    `Your project "${project.title}" has been marked as completed by ${req.user.name}.`,
    "Comment",
    "/students/status",
    "Low",
  );

  res.status(200).json({
    success: true,
    message: "Project marked as completed successfully",
    data: { project: updatedProject },
  });
});

const addFeedbackToProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;
  const { type, title, message } = req.body;

  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor.toString() !== teacherId.toString()) {
    return next(
      new ErrorHandler(
        "You are not authorized to add feedback to this project",
        403,
      ),
    );
  }

  if (!message || !title) {
    return next(
      new ErrorHandler("Title and message are required for feedback", 400),
    );
  }

  const { project: updatedProject, latestFeedback } =
    await projectService.addFeedback(projectId, {
      supervisorId: teacherId,
      type,
      title,
      message,
    });

  await notificationService.notifyUser(
    project.student._id,
    `Your project "${project.title}" has received new feedback from ${req.user.name}.`,
    "Comment",
    "/students/feedback",
    "Low",
  );

  res.status(200).json({
    success: true,
    message: "Feedback added to project successfully",
    data: { project: updatedProject, feedback: latestFeedback },
  });
});

const getStudentProjectFiles = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;
  const { projects } =
    await projectService.getProjectsBySupervisorId(teacherId);

  const allFiles = projects.flatMap((project) =>
    project.files.map((file) => ({
      ...file.toObject(),
      projectId: project._id,
      projectTitle: project.title,
      studentName: project.student.name,
      studentEmail: project.student.email,
    })),
  );

  res.status(200).json({
    success: true,
    message: "Project files fetched successfully",
    data: { files: allFiles },
  });
});

const downloadStudentProjectFiles = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const supervisorId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (
    !project ||
    project.supervisor._id.toString() !== supervisorId.toString()
  ) {
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
  getTeacherDashboardStats,
  getRequests,
  acceptRequest,
  rejectRequest,
  getAssignedStudents,
  markProjectAsCompleted,
  addFeedbackToProject,
  getStudentProjectFiles,
  downloadStudentProjectFiles,
};
