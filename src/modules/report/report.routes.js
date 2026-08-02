import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { toLowerCaseEnum } from "./report.middleware.js";
import ReportController from "./report.controller.js";
import {
  createReportValidation,
  getMyReportsValidation,
  getReportByIdValidation,
  reviewReportValidation,
  resolveReportValidation,
  rejectReportValidation,
  reportAnalyticsValidation,
  assignReportValidation,
  bulkUpdateReportsValidation,
  escalateReportValidation,
} from "./report.validation.js";

const router = Router();

const reportLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many report attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/",
  reportLimiter,
  authenticate,
  toLowerCaseEnum,
  validate(createReportValidation),
  ReportController.createReport
);

router.get(
  "/my",
  authenticate,
  validate(getMyReportsValidation),
  ReportController.getMyReports
);

router.get(
  "/analytics",
  authenticate,
  authorize("admin", "super_admin"),
  reportLimiter,
  validate(reportAnalyticsValidation),
  ReportController.getReportAnalytics
);

router.get(
  "/moderation-stats",
  authenticate,
  authorize("admin", "super_admin"),
  reportLimiter,
  validate(reportAnalyticsValidation),
  ReportController.getModerationStats
);

router.get(
  "/:reportId",
  authenticate,
  validate(getReportByIdValidation),
  ReportController.getReportById
);

router.patch(
  "/:reportId/review",
  authenticate,
  authorize("admin", "super_admin"),
  reportLimiter,
  toLowerCaseEnum,
  validate(reviewReportValidation),
  ReportController.reviewReport
);

router.patch(
  "/:reportId/resolve",
  authenticate,
  authorize("admin", "super_admin"),
  reportLimiter,
  toLowerCaseEnum,
  validate(resolveReportValidation),
  ReportController.resolveReport
);

router.patch(
  "/:reportId/reject",
  authenticate,
  authorize("admin", "super_admin"),
  reportLimiter,
  toLowerCaseEnum,
  validate(rejectReportValidation),
  ReportController.rejectReport
);

router.patch(
  "/:reportId/assign",
  authenticate,
  authorize("admin", "super_admin"),
  reportLimiter,
  validate(assignReportValidation),
  ReportController.assignReport
);

router.patch(
  "/:reportId/escalate",
  authenticate,
  authorize("admin", "super_admin"),
  reportLimiter,
  validate(escalateReportValidation),
  ReportController.escalateReport
);

router.patch(
  "/bulk",
  authenticate,
  authorize("admin", "super_admin"),
  reportLimiter,
  validate(bulkUpdateReportsValidation),
  ReportController.bulkUpdateReports
);

export default router;
