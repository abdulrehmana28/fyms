import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Supervisor reference is required"],
    },
    type: {
      type: String,
      enum: ["Comment", "Revision Request", "Approval"],
      default: "Comment",
    },
    title: {
      type: String,
      required: [true, "Feedback title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Feedback message is required"],
      maxlength: [1000, "Feedback message cannot exceed 1000 characters"],
      trim: true,
    },
  },
  { timestamps: true },
);

const projectSchema = new mongoose.Schema(
  {
    // Group members — replaces the old singular `student` field.
    // The first element is always the project creator (leader).
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Immutable reference to the student who created the project / group leader.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project creator reference is required"],
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [200, "Project title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxlength: [2000, "Project description cannot exceed 2000 characters"],
    },
    //   TODO: use enum form utils/constants.js
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "In Progress", "Completed"],
      default: "Pending",
    },
    // --- Group / Invite fields ---
    inviteCode: {
      type: String,
      default: null,
    },
    inviteCodeExpiresAt: {
      type: Date,
      default: null,
    },
    maxMembers: {
      type: Number,
      default: 2,
      min: [1, "A project must have at least 1 member"],
    },
    files: [
      {
        fileType: {
          type: String,
          required: [true, "File type is required"],
        },
        fileUrl: {
          type: String,
          required: [true, "File URL is required"],
        },
        originalName: {
          type: String,
          required: [true, "file name is required"],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    feedback: [feedbackSchema],
    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    // adds createdAt and updatedAt fields by default
    timestamps: true,
  },
);

// Indexes for optimizing queries
projectSchema.index({ members: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ supervisor: 1 });
projectSchema.index({ inviteCode: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

export const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
