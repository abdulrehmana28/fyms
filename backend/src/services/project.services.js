import { Project } from "../models/project.models.js";
import { ErrorHandler } from "../middlewares/error.middleware.js";

const getProjectsByStudentId = async (studentId) => {
  return await Project.findOne({ student: studentId }).sort({ createdAt: -1 });
};

const createProject = async (projectData) => {
  const project = new Project(projectData);
  await project.save();
  return project;
};

const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("feedback.supervisorId", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  return project;
};

const getAllProjects = async () => {
  const projects = await Project.find()
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  if (!projects) {
    throw new ErrorHandler("No projects found", 404);
  }
  // TODO: check if any error with the return type in any function
  // TODO: Array OR Object
  // TODO: changed to return projects[] directly
  // TODO: previously was: return { projects };
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
    .populate("student", "name email")
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

const getProjectsBySupervisorId = async (supervisorId) => {
  return await getAllProjects({ supervisor: supervisorId });
};

export {
  getProjectsByStudentId,
  createProject,
  getProjectById,
  addFilesToProject,
  getAllProjects,
  markComplete,
  addFeedback,
  getProjectsBySupervisorId,
};
