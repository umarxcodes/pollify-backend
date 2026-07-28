import express from "express";
import { ApiError } from "../../utils/apiError.js";
import { authenticate } from "./auth.middleware.js";

export const authRouter = express.Router();

authRouter.get("/me", authenticate, async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated",
    user: req.user,
  });
});

authRouter.get("/admin", authenticate, authorize("admin"), async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin area",
  });
});

function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden: Insufficient permissions");
    }
    next();
  };
}
