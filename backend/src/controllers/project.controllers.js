import * as projectService from "../services/project.services.js";
import * as userService from "../services/user.services.js";
import * as fileService from "../services/file.services.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ErrorHandler } from "../middlewares/error.middleware.js";

const downloadProjectFiles = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const user = req.user;
  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found ", 404));
  }

  const userRole = (user.role || "").toLowerCase();
  const userId = user._id?.toString() || user.id;

  const hasAccess =
    userRole === "admin" ||
    (userRole === "supervisor" &&
      project.supervisor._id.toString() === userId) ||
    (userRole === "student" && project.student._id.toString() === userId);

  if (!hasAccess) {
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

export { downloadProjectFiles };
