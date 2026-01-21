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

export { createNotification, notifyUser };
