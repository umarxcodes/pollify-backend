import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import authController from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { registerValidation } from "./auth.validation.js";

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

const multer = (await import("multer")).default;
const storage = multer.memoryStorage();

// Accept jpg, jpeg, png, webp only; enforce 2MB limit
const fileFilter = (req, file, cb) => {
  if (!file) return cb(null, true);

  const acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (acceptedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid profile image type"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter,
});

router.post(
  "/register",
  registerRateLimiter,
  upload.single("profileImage"),
  validate(registerValidation),
  authController.register
);

export default router;
