import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "dotenv";
import { AvailableUserRoles, UserRoleEnums } from "../utils/constants.js";

config();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      maxLength: [50, "Name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email address",
      ],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
      select: false,
      minLength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRoleEnums.STUDENT,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    department: {
      type: String,
      trim: true,
      default: null,
    },
    expertise: {
      type: [String],
      default: [],
    },
    maxStudents: {
      type: Number,
      default: 3,
      min: [1, "Min students must be at least 1"],
      max: [5, "Max students cannot exceed 5"],
    },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

// add password hashing on pre hook

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method with the hashed password

userSchema.methods.isPasswordCorrect = async function (currentEnteredPassword) {
  return await bcrypt.compare(currentEnteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex").toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Generate JWT Token
// userSchema.methods.generateToken = async function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     }
//   );
// };

userSchema.methods.hasCapacity = function () {
  if (this.role !== UserRoleEnums.TEACHER) return false;
  return this.assignedStudents.length < this.maxStudents;
};

export const User = mongoose.model("User", userSchema);
