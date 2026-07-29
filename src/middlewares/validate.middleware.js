import { ApiError } from "../utils/apiError.js";

// Generic Zod validation middleware for request payloads
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const input = {
        body: req.body,
        query: req.query,
        params: req.params,
        file: req.file,
      };

      const parsed = schema.safeParse(input);

      if (!parsed.success) {
        const errors = parsed.error.issues.map((issue) => ({
          field:
            issue.path.filter((part) => part !== "body").join(".") || "request",
          message: issue.message,
        }));
        return next(new ApiError(400, "Validation failed", errors));
      }

      req.body = parsed.data.body || req.body;
      req.query = parsed.data.query || req.query;
      req.params = parsed.data.params || req.params;

      if (parsed.data.file) {
        req.file = parsed.data.file;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
