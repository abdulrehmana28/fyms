import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      maxlength: [1000, "Notification message cannot exceed 1000 characters"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null,
    },
    type: {
      //TODO: add enum from utils/constants.js
      type: String,
      enum: [
        "Info",
        "Warning",
        "Alert",
        "Success",
        "Request",
        "Feedback",
        "Deadline",
        "Meeting",
        "System",
      ],
      default: "Info",
    },
    priority: {
      type: String,
      //TODO: add enum from utils/constants.js
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
  },
  {
    // adds createdAt and updatedAt fields by default
    timestamps: true,
  },
);

// Indexes for optimizing queries
notificationSchema.index({ user: 1, isRead: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
