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
    .populate("supervisor", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  return project;
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

export {
  getProjectsByStudentId,
  createProject,
  getProjectById,
  addFilesToProject,
};
