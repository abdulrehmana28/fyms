import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **********************
// Error Middleware must be the last middleware
app.use(errorMiddleware);
// ----------------------

// routes imports
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// routes usage
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin", adminRoutes);

export default app;
