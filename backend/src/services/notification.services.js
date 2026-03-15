import { Notification } from "../models/notification.models.js";
import { Project } from "../models/project.models.js";

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

/**
 * Notify all members of a project/group.
 */
const notifyProjectMembers = async (
  projectId,
  message,
  type = "Info",
  link = "",
  priority = "Low",
) => {
  const project = await Project.findById(projectId);
  if (!project) return;
  const promises = project.members.map((memberId) =>
    notifyUser(memberId, message, type, link, priority),
  );
  return await Promise.all(promises);
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
  notifyProjectMembers,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
