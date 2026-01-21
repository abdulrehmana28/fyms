import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { error } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureUploadDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    if (req.route.path.includes("/projects/upload-files/:projectId")) {
      uploadPath = path.join(
        __dirname,
        "../../uploads/projects/",
        req.params.projectId,
      );
    } else if (req.route.path.includes("/projects/users/:projectId")) {
      uploadPath = path.join(
        __dirname,
        "../../uploads/users/",
        req.params.userId,
      );
    } else {
      uploadPath = path.join(
        __dirname,
        "../../uploads/temp",
        req.params.userId,
      );
    }

    ensureUploadDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extname = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extname);
  },
});

const filesFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/t-rar",
    "application/vnd.rar",
    "application/octet-stream",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
    "application/javascript",
    "text/css",
    "text/html",
    "application/json",
  ];

  const allowedExtensions = [
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "zip",
    "rar",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "txt",
    "js",
    "css",
    "html",
    "json",
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension.slice(1))
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, ZIP, RAR, images, text, js, CSS, HTML, and JSON files are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: filesFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  files: 10,
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 25MB limit.",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "File count exceeds the 10 files limit.",
      });
    }

    if (err.message === err.message.includes("Invalid file type")) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }
  next(err);
};

export { upload, handleUploadError };