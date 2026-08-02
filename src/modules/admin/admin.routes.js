import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import AdminController from "./admin.controller.js";
import {
  getUsersValidation,
  getUserValidation,
  updateUserRoleValidation,
  suspendUserValidation,
  deleteUserValidation,
  getPollsValidation,
  pollActionValidation,
  getCommentsValidation,
  commentActionValidation,
  categoriesValidation,
  categoryIdValidation,
  createNotificationValidation,
  getAuditLogsValidation,
  updateSettingsValidation,
  getReportsValidation,
  reportActionValidation,
  getNotificationsValidation,
} from "./admin.validation.js";

const router = Router();

const adminLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many admin requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Dashboard
router.get(
  "/dashboard",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  AdminController.getDashboard
);

// Users
router.get(
  "/users",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(getUsersValidation),
  AdminController.getUsers
);
router.get(
  "/users/:id",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(getUserValidation),
  AdminController.getUser
);
router.patch(
  "/users/:id/role",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(updateUserRoleValidation),
  AdminController.updateUserRole
);
router.patch(
  "/users/:id/suspend",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(suspendUserValidation),
  AdminController.suspendUser
);
router.patch(
  "/users/:id/unsuspend",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(suspendUserValidation),
  AdminController.unsuspendUser
);
router.delete(
  "/users/:id",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(deleteUserValidation),
  AdminController.deleteUser
);

// Polls
router.get(
  "/polls",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(getPollsValidation),
  AdminController.getPolls
);
router.delete(
  "/polls/:pollId",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(pollActionValidation),
  AdminController.deletePoll
);
router.patch(
  "/polls/:pollId/restore",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(pollActionValidation),
  AdminController.restorePoll
);
router.patch(
  "/polls/:pollId/feature",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(pollActionValidation),
  AdminController.featurePoll
);
router.patch(
  "/polls/:pollId/close",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(pollActionValidation),
  AdminController.closePoll
);

// Comments
router.get(
  "/comments",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(getCommentsValidation),
  AdminController.getComments
);
router.delete(
  "/comments/:id",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(commentActionValidation),
  AdminController.deleteComment
);
router.patch(
  "/comments/:id/restore",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(commentActionValidation),
  AdminController.restoreComment
);

// Reports
router.get(
  "/reports",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(getReportsValidation),
  AdminController.getReports
);
router.get(
  "/reports/:id",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(reportActionValidation),
  AdminController.getReport
);
router.patch(
  "/reports/:id/review",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(reportActionValidation),
  AdminController.reviewReport
);
router.patch(
  "/reports/:id/resolve",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(reportActionValidation),
  AdminController.resolveReport
);
router.patch(
  "/reports/:id/reject",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(reportActionValidation),
  AdminController.rejectReport
);

// Notifications
router.get(
  "/notifications",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(getNotificationsValidation),
  AdminController.getNotifications
);

// Categories
router.get(
  "/categories",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  validate(categoriesValidation),
  AdminController.getCategories
);
router.post(
  "/categories",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(categoriesValidation),
  AdminController.createCategory
);
router.patch(
  "/categories/:id",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(categoryIdValidation),
  AdminController.updateCategory
);
router.delete(
  "/categories/:id",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(categoryIdValidation),
  AdminController.deleteCategory
);
router.patch(
  "/categories/:id/restore",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(categoryIdValidation),
  AdminController.restoreCategory
);

// Notifications
router.post(
  "/notifications",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(createNotificationValidation),
  AdminController.createNotification
);
router.post(
  "/notifications/broadcast",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(createNotificationValidation),
  AdminController.broadcastNotification
);

// Audit Logs
router.get(
  "/audit-logs",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(getAuditLogsValidation),
  AdminController.getAuditLogs
);
router.get(
  "/audit-logs/export",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(getAuditLogsValidation),
  AdminController.exportAuditLogs
);

// Analytics
router.get(
  "/analytics",
  authenticate,
  authorize("admin", "super_admin"),
  adminLimiter,
  AdminController.getAnalytics
);

// Settings
router.patch(
  "/settings",
  authenticate,
  authorize("super_admin"),
  adminLimiter,
  validate(updateSettingsValidation),
  AdminController.updateSettings
);

export default router;
