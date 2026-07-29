import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkNotificationOwnership } from "./notification.middleware.js";
import NotificationController from "./notification.controller.js";
import {
  getNotificationsValidation,
  getNotificationByIdValidation,
  markAsReadValidation,
  markAllAsReadValidation,
  deleteNotificationValidation,
  deleteAllNotificationsValidation,
  updatePreferencesValidation,
} from "./notification.validation.js";

const router = Router();

const notificationLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many notification requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get(
  "/",
  authenticate,
  notificationLimiter,
  validate(getNotificationsValidation),
  NotificationController.getNotifications
);

router.get(
  "/unread-count",
  authenticate,
  notificationLimiter,
  NotificationController.getUnreadCount
);

router.get("/preferences", authenticate, NotificationController.getPreferences);

router.patch(
  "/preferences",
  authenticate,
  validate(updatePreferencesValidation),
  NotificationController.updatePreferences
);

router.get(
  "/:notificationId",
  authenticate,
  validate(getNotificationByIdValidation),
  checkNotificationOwnership,
  NotificationController.getNotificationById
);

router.patch(
  "/:notificationId/read",
  authenticate,
  validate(markAsReadValidation),
  checkNotificationOwnership,
  NotificationController.markAsRead
);

router.delete(
  "/:notificationId",
  authenticate,
  validate(deleteNotificationValidation),
  checkNotificationOwnership,
  NotificationController.deleteNotification
);

router.patch(
  "/read-all",
  authenticate,
  notificationLimiter,
  validate(markAllAsReadValidation),
  NotificationController.markAllAsRead
);

router.delete(
  "/",
  authenticate,
  notificationLimiter,
  validate(deleteAllNotificationsValidation),
  NotificationController.deleteAllNotifications
);

export default router;
