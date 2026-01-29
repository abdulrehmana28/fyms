import jwt from "jsonwebtoken";
import { config } from "dotenv";
// import { UserRoleEnums } from "../utils/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ErrorHandler } from "../middlewares/error.middleware.js";

config();

// Authentication middleware to verify JWT token user is logged in or not

const authMiddleware = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorHandler(
        "Not authorized, Please login to access this resource",
        401,
      ),
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id).select(
    "-resetPasswordToken -resetPasswordExpire",
  );

  if (!req.user) {
    return next(new ErrorHandler("User not found", 404));
  }

  next();
});

// Authorization middleware checking user roles

const authorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not authorized to access this resource`,
          403,
        ),
      );
    }
    next();
  };
};

export { authMiddleware, authorized };
