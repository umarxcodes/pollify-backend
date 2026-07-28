import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/apiError.js";
import { env } from "../../config/env.config.js";

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authorization header missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid or expired token");
    }
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden: Insufficient permissions");
    }
    next();
  };
};
