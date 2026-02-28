export const UserRoleEnums = {
  STUDENT: "Student",
  SUPERVISOR: "Supervisor",
  ADMIN: "Admin",
};

export const AvailableUserRoles = Object.values(UserRoleEnums);

export const NotificationTypeEnums = {
  INFO: "Info",
  WARNING: "Warning",
  ALERT: "Alert",
  SUCCESS: "Success",
  REQUEST: "Request",
  FEEDBACK: "Feedback",
  DEADLINE: "Deadline",
  MEETING: "Meeting",
  SYSTEM: "System",
};

export const AvailableNotificationTypes = Object.values(NotificationTypeEnums);

export const NotificationPriorityEnums = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const AvailableNotificationPriorities = Object.values(
  NotificationPriorityEnums,
);
