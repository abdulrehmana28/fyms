import { config } from "dotenv";
import jwt from "jsonwebtoken";

config();

const generateToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ), // 7 days
      httpOnly: true,
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};

export { generateToken };
