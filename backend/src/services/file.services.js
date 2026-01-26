import fs from "fs";
import path from "path";
import { ErrorHandler } from "../middlewares/error.middleware.js";

const streamDownload = (filePath, res, originalName) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new ErrorHandler(404, "File not found");
    }

    res.download(filePath, originalName, (err) => {
      if (err) {
        throw new ErrorHandler(500, "Error downloading file");
      }
    });
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export { streamDownload };
