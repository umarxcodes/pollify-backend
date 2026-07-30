import { ApiError } from "../utils/apiError.js";
import logger from "../utils/logger.js";

// Handle requests to undefined routes
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

// Centralized error handler: normalizes errors into consistent JSON responses
export const errorHandler = (err, req, res, _next) => {
  const duplicateKey = err?.code === 11000;
  const validationError = err?.name === "ValidationError";
  const castError = err?.name === "CastError";

  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = err.errors;

  if (castError) {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (duplicateKey) {
    statusCode = 409;
    message = "An account with those details already exists";
  } else if (validationError) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors || {}).map((e) => e.message);
  } else if (err) {
    statusCode = err.statusCode || 500;
    message = err.message || "Internal Server Error";
    errors = err.errors;
  }

  logger.error(
    {
      err,
      statusCode,
      message,
      path: req.originalUrl,
      method: req.method,
    },
    "Unhandled error"
  );

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
