import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getProfileValidation,
  updateProfileValidation,
  uploadProfileImageValidation,
  deleteAccountValidation,
} from "./user.validation.js";
import userController from "./user.controller.js";

const router = Router();

router.get("/me", authenticate, userController.getProfile);
router.get("/stats", authenticate, userController.getStats);
router.get("/:username", userController.getPublicProfile);
router.patch(
  "/profile",
  authenticate,
  validate(updateProfileValidation),
  userController.updateProfile
);
router.post(
  "/profile-image",
  authenticate,
  validate(uploadProfileImageValidation),
  userController.uploadProfileImage
);
router.delete(
  "/profile-image",
  authenticate,
  userController.deleteProfileImage
);
router.delete(
  "/",
  authenticate,
  validate(deleteAccountValidation),
  userController.deleteAccount
);

export default router;
