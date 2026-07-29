import { ZodError } from "zod";

// Standardized API error class with HTTP status code support
export class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = undefined,
    stack = ""
  ) {
    super(message, { cause: { statusCode } });
    this.statusCode = statusCode;
    this.message = message;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static isApiError(err) {
    return err instanceof ApiError;
  }
}

// Convert Zod validation errors into ApiError instances
export const handleValidationError = (error) => {
  if (error instanceof ZodError) {
    return new ApiError(400, "Validation failed", error.issues);
  }
  return error;
};
