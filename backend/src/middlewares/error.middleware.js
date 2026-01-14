class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    err.message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(err.message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid, try again";
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token is expired, try again";
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "CastError") {
    const message = "Resource not found. Invalid: " + err.path;
    err = new ErrorHandler(message, 400);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((value) => value.message)
        .join(", ")
    : err.message;

  res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export { errorMiddleware, ErrorHandler };
