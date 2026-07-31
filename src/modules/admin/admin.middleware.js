import { ApiError } from "../../utils/apiError.js";
import AuditLog from "../../models/AuditLog.js";
import User from "../../models/User.js";

export const logAdminAction = (action, targetType) => {
  return async (req, res, next) => {
    try {
      const originalSend = res.json;
      res.json = async function (data) {
        if (data && data.success) {
          await AuditLog.create({
            adminId: req.user?.id,
            action,
            targetType,
            targetId:
              req.params.id ||
              req.params.pollId ||
              req.params.commentId ||
              null,
            details: req.body || {},
            ipAddress: req.ip || "",
            userAgent: req.get("user-agent") || "",
          });
        }
        return originalSend.call(this, data);
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkAdminAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Please login to access this resource");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!["admin", "super_admin"].includes(user.role)) {
      throw new ApiError(403, "You are not authorized to access this resource");
    }

    req.user.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
};
