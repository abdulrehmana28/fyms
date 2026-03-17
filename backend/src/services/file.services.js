import fs from "fs";
import path from "path";
import { ErrorHandler } from "../middlewares/error.middleware.js";

const streamDownload = (filePath, res, originalName) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new ErrorHandler("File not found", 404);
    }

    res.download(filePath, originalName, (err) => {
      if (err) {
        // If headers are already sent, we can't send a JSON response.
        // The best we can do is end the response if it hasn't ended.
        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message: "Error downloading file",
          });
        }
        console.error("Error during file download:", err);
      }
    });
  } catch (error) {
    if (error instanceof ErrorHandler) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export { streamDownload };
