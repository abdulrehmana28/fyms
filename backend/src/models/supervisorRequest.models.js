import mongoose from "mongoose";

const supervisorRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Supervisor reference is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [250, "Message cannot exceed 250 characters"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      default: "Pending",
      //TODO: User enum from utils/constants.js
      enum: ["Pending", "Approved", "Rejected"],
    },
  },

  {
    // adds createdAt and updatedAt fields by default
    timestamps: true,
  },
);

// Indexes for optimizing queries
supervisorRequestSchema.index({ student: 1 });
supervisorRequestSchema.index({ supervisor: 1 });
supervisorRequestSchema.index({ status: 1 });

export const SupervisorRequest =
  mongoose.models.SupervisorRequest ||
  mongoose.model("SupervisorRequest", supervisorRequestSchema);
