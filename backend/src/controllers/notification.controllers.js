import { Notification } from "../models/notification.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as notificationService from "../services/notification.services.js";
import { ErrorHandler } from "../middlewares/error.middleware.js";

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  let query = {};

  if (role === "Admin") {
    query.type = { $in: ["Request"] };
  } else {
    query.user = userId;
  }

  const notifications = await Notification.find(query).sort({ createdAt: -1 });
  const unreadOnly = notifications.filter(
    (notification) => !notification.isRead,
  );
  const readOnly = notifications.filter((notification) => notification.isRead);

  const highPriorityMessages = notifications.filter(
    (notification) => notification.priority === "High",
  );

  // Get notifications from the current week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const thisWeekNotifications = notifications.filter((notification) => {
    const createdAt = new Date(notification.createdAt);
    return createdAt >= startOfWeek && createdAt <= endOfWeek;
  });

  res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    data: {
      notifications,
      unreadOnly: unreadOnly.length,
      readOnly: readOnly.length,
      highPriorityMessages: highPriorityMessages.length,
      thisWeekNotifications: thisWeekNotifications.length,
    },
  });
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await notificationService.markAsRead(id, userId);

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: { notification },
  });
});

const markAllNotificationAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await notificationService.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: { notification },
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const notification = await notificationService.deleteNotification(id, userId);

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationAsRead,
  deleteNotification,
};
