import { Router } from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationAsRead,
  deleteNotification,
} from "../controllers/notification.controllers.js";

import { authMiddleware, authorized } from "../middlewares/auth.middleware.js";

const router = Router();

// **********************
// Notification Routes
// ----------------------

// Route to get notifications
router.get("/", authMiddleware, getNotifications);

// Route to mark a notification as read
router.put("/mark-as-read/:id", authMiddleware, markNotificationAsRead);

// Route to mark all notifications as read
router.put("/mark-all-as-read", authMiddleware, markAllNotificationAsRead);

// Route to delete a notification
router.delete("/:id/delete", authMiddleware, deleteNotification);

export default router;
