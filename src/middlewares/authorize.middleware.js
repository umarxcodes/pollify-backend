import { ApiError } from "../utils/apiError.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Please login to access this resource"));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(403, "You are not authorized to access this resource")
      );
    }

    next();
  };
};
