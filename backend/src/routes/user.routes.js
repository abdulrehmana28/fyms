import { Router } from "express";
import multer from "multer";
import {
  registerUser,
  forgotPassword,
  loginUser,
  logoutUser,
  resetPassword,
  getUser,
} from "../controllers/auth.controllers.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";


const router = Router();

// Route to register a new user
router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/me", authMiddleware, getUser);

router.post("/logout", authMiddleware, logoutUser);

router.post("/password/forgot", forgotPassword);

router.put("/password/reset/:token", resetPassword);

export default router;
