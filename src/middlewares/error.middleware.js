import { ApiError } from "../utils/apiError.js";

// Handle requests to undefined routes
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

// Centralized error handler: normalizes errors into consistent JSON responses
export const errorHandler = (err, req, res, _next) => {
  const duplicateKey = err?.code === 11000;
  const statusCode = duplicateKey ? 409 : err.statusCode || 500;
  const message = duplicateKey
    ? "An account with those details already exists"
    : err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
