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
import { isFileSystemAvailable } from "../utils/fsAvailability.js";
import { Project } from "../models/project.models.js";
import { Notification } from "../models/notification.models.js";
import { SupervisorRequest } from "../models/supervisorRequest.models.js";
import {
  generateRequestAcceptanceTemplate,
  generateRequestRejectionTemplate,
} from "../utils/emailTemplates.js";

const getSupervisorDashboardStats = asyncHandler(async (req, res, next) => {
  const supervisorId = req.user._id;

  const totalPendingRequests = await SupervisorRequest.countDocuments({
    supervisor: supervisorId,
    status: "Pending",
  });

  const completedProjects = await Project.countDocuments({
    supervisor: supervisorId,
    status: "Completed",
  });

  const recentNotifications = await Notification.find({ user: supervisorId })
    .sort({ createdAt: -1 })
    .limit(5);

  const dashboardStats = {
    totalPendingRequests,
    completedProjects,
    recentNotifications,
  };

  res.status(200).json({
    success: true,
    message: "Supervisor dashboard stats fetched successfully",
    data: { dashboardStats },
  });
});

const getRequests = asyncHandler(async (req, res, next) => {
  const supervisorId = req.user._id;

  const filters = { supervisor: supervisorId };

  const { requests, total } = await requestService.getAllRequests(filters);

  const studentIds = requests
    .map((r) => r.student?._id)
    .filter((id) => id !== undefined && id !== null);

  let latestProjectsMap = {};

  if (studentIds.length > 0) {
    const projects = await Project.aggregate([
      { $match: { student: { $in: studentIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$student",
          latestProject: { $first: "$$ROOT" },
        },
      },
    ]);

    projects.forEach((p) => {
      latestProjectsMap[p._id.toString()] = p.latestProject;
    });
  }

  const updatedRequests = requests.map((reqObj) => {
    const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;
    if (requestObj?.student?._id) {
      const latestProject =
        latestProjectsMap[requestObj.student._id.toString()] || null;
      return { ...requestObj, latestProject };
    }
    return requestObj;
  });

  res.status(200).json({
    success: true,
    message: "Requests fetched successfully",
    data: { requests: updatedRequests, total },
  });
});

const acceptRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const supervisorId = req.user._id;

  // our updated service now returns both the request object and the
  // newly-updated project (if any). callers can ignore the project when not
  // needed.
  const result = await requestService.acceptRequestById(
    requestId,
    supervisorId,
  );

  if (!result || !result.request) {
    return next(
      new ErrorHandler("Request not found or already processed", 404),
    );
  }

  const { request, project } = result;

  await notificationService.notifyUser(
    request.student._id,
    `${request.student.name}'s request has been accepted by ${req.user.name}.`,
    "Success",
    "/students/status",
    "High",
  );

  const student = await User.findById(request.student._id);
  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }
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
    data: { request, project },
  });
});

const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const supervisorId = req.user._id;

  const request = await requestService.rejectRequestById(
    requestId,
    supervisorId,
  );

  if (!request) {
    return next(
      new ErrorHandler("Request not found or already processed", 404),
    );
  }

  await notificationService.notifyUser(
    request.student._id,
    `${request.student.name}'s request has been rejected by ${req.user.name}.`,
    "Alert",
    "/students/status",
    "High",
  );

  const student = await User.findById(request.student._id);
  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }
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
  const supervisorId = req.user._id;
  const students = await User.find({ supervisor: supervisorId })
    .populate("project")
    .sort({ createdAt: -1 });

  const total = await User.countDocuments({ supervisor: supervisorId });

  res.status(200).json({
    success: true,
    message: "Assigned students fetched successfully",
    data: { students, total },
  });
});

const markProjectAsCompleted = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const supervisorId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor._id.toString() !== supervisorId.toString()) {
    return next(
      new ErrorHandler("You are not authorized to complete this project", 403),
    );
  }

  const updatedProject = await projectService.markComplete(projectId);

  await notificationService.notifyUser(
    project.student._id,
    `${project.student.name}'s project "${project.title}" has been marked as completed by ${req.user.name}.`,
    "Success",
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
  const supervisorId = req.user._id;
  const { type, title, message } = req.body;

  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor._id.toString() !== supervisorId.toString()) {
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
    await projectService.addFeedback(
      projectId,
      supervisorId,
      type,
      title,
      message,
    );

  await notificationService.notifyUser(
    project.student._id,
    `${project.student.name}'s project "${project.title}" has received new feedback from ${req.user.name}.`,
    "Feedback",
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
  const supervisorId = req.user._id;
  const projects = await projectService.getProjectsBySupervisor(supervisorId);

  const allFiles = projects.flatMap((project) =>
    project.files.map((file) => ({
      ...(file.toObject ? file.toObject() : file),
      projectId: project._id,
      projectTitle: project.title,
      studentName: project.student?.name || "N/A",
      studentEmail: project.student?.email || "N/A",
    })),
  );

  res.status(200).json({
    success: true,
    message: "Project files fetched successfully",
    data: { files: allFiles },
  });
});

const downloadStudentProjectFiles = asyncHandler(async (req, res, next) => {
  if (!isFileSystemAvailable()) {
    return res.status(503).json({
      success: false,
      message: "File system unavailable. Cannot download files at this time.",
    });
  }

  const { projectId, fileId } = req.params;
  const supervisorId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor._id.toString() !== supervisorId.toString()) {
    return next(
      new ErrorHandler(
        "You do not have permission to download files from this project",
        403,
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
  getSupervisorDashboardStats,
  getRequests,
  acceptRequest,
  rejectRequest,
  getAssignedStudents,
  markProjectAsCompleted,
  addFeedbackToProject,
  getStudentProjectFiles,
  downloadStudentProjectFiles,
};
