import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Deadline name is required"],
      maxlength: [100, "Deadline name cannot exceed 100 characters"],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator reference is required"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },

  {
    // adds createdAt and updatedAt fields by default
    timestamps: true,
  },
);

// Indexes for optimizing queries
deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ createdBy: 1 });
deadlineSchema.index({ project: 1 });

export const Deadline =
  mongoose.models.Deadline || mongoose.model("Deadline", deadlineSchema);
