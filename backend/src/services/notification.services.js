import { Notification } from "../models/notification.models.js";

const createNotification = async (notificationData) => {
  const newNotification = new Notification(notificationData);
  return await newNotification.save();
};

const notifyUser = async (
  userId,
  message,
  type = "Info",
  link = "",
  priority = "Low",
) => {
  return await createNotification({
    user: userId,
    message: message,
    type: type,
    link: link,
    priority: priority,
  });
};

const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true },
  );
};

const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true },
  );
};

const deleteNotification = async (notificationId, userId) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });
};

export {
  createNotification,
  notifyUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
