import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { setFileSystemAvailable } from "./utils/fsAvailability.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

const app = express();

// build a list of allowed origins; drop any falsy entries and only
// expose localhost when running outside of production. this prevents an
// undefined entry from creeping into the array and keeps the prod config
// locked down.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://captrak.vercel.app",
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
    : []),
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
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
  // log the full message for debugging and flip the availability flag so
  // request handlers can respond with a service‑unavailable status instead
  console.error(
    "Failed to create required filesystem directories:",
    error.message,
  );
  setFileSystemAvailable(false);
  // note: we intentionally do not exit the process so reads still work; if
  // you prefer the server to crash immediately uncomment the next line.
  // process.exit(1);
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
