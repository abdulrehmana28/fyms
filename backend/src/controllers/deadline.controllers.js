import { ErrorHandler } from "../middlewares/error.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Deadline } from "../models/deadline.models.js";
import { Project } from "../models/project.models.js";
import { getProjectById } from "../services/project.services.js";

const createDeadline = asyncHandler(async (req, res, next) => {
  const { dueDate, name } = req.body;
  const { projectId } = req.params;

  if (!dueDate || !name) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  if (!projectId) {
    return next(new ErrorHandler("Project ID is required", 400));
  }

  const project = await getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const deadlineData = {
    name: name, // name is in the schema
    dueDate: new Date(dueDate),
    project: project || null,
    createdBy: req.user._id,
  };

  const deadline = await Deadline.create(deadlineData);

  await deadline
    .populate([
      { path: "createdBy", select: "name email" },
      //TODO: { path: "project", select: "title student" },
    ])
    .execPopulate();

  if (project) {
    await Project.findByIdAndUpdate(
      project,
      { deadline: dueDate },
      { new: true, runValidators: true },
    );
  }

  res.status(201).json({
    success: true,
    message: "Deadline created successfully",
    data: deadline,
  });
});

export { createDeadline };
