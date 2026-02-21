import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "https://captrak.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

const uploadDir = path.join(__dirname, "../uploads");
const tempDir = path.join(__dirname, "../temp");

try {
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });
} catch (error) {
  console.log(
    "Error creating directories (likely due to read-only filesystem on Vercel):",
    error.message,
  );
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes imports
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import projectRoutes from "./routes/project.routes.js";
import deadlineRoutes from "./routes/deadline.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
// routes usage
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/deadline", deadlineRoutes);
app.use("/api/v1/teacher", teacherRoutes);
// **********************
// Error Middleware must be the last middleware
app.use(errorMiddleware);
// ----------------------

export default app;
