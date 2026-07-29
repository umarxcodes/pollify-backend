import { verifyAccessToken } from "../services/jwt.service.js";
import { ApiError } from "../utils/apiError.js";

export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Please login to access this resource");
    }

    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.userId || decoded.sub, role: decoded.role };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
};
