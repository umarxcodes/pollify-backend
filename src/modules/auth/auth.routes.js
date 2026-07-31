import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import authController from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  registerValidation,
  verifyEmailValidation,
  resendVerificationValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  updateProfileValidation,
} from "./auth.validation.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { upload } from "../../middlewares/upload.js";
import { verifyCsrfToken } from "../../middlewares/csrf.middleware.js";

const router = Router();

// Rate limit registration to 5 attempts per 15 minutes per IP
const registerRateLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit login to 10 attempts per 15 minutes per IP
const loginRateLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  registerRateLimiter,
  upload.single("profileImage"),
  validate(registerValidation),
  authController.register
);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginValidation),
  authController.login
);

router.post(
  "/verify-email",
  validate(verifyEmailValidation),
  authController.verifyEmail
);

router.post(
  "/resend-verification",
  registerRateLimiter,
  validate(resendVerificationValidation),
  authController.resendVerificationEmail
);
router.post(
  "/refresh-token",
  loginRateLimiter,
  verifyCsrfToken,
  authController.refreshToken
);
router.post("/logout", verifyCsrfToken, authenticate, authController.logout);
router.post(
  "/forgot-password",
  loginRateLimiter,
  validate(forgotPasswordValidation),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  loginRateLimiter,
  validate(resetPasswordValidation),
  authController.resetPassword
);
router.patch(
  "/change-password",
  verifyCsrfToken,
  authenticate,
  validate(changePasswordValidation),
  authController.changePassword
);
router.get("/me", authenticate, authController.me);
router.patch(
  "/profile",
  verifyCsrfToken,
  authenticate,
  upload.single("profileImage"),
  validate(updateProfileValidation),
  authController.updateProfile
);

export default router;
