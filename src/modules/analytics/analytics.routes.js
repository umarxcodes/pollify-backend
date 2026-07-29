import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import AnalyticsController from "./analytics.controller.js";
import {
  pollAnalyticsValidation,
  chartDataValidation,
  dashboardValidation,
  trendingValidation,
} from "./analytics.validation.js";

const router = Router();

router.get(
  "/polls/:pollId",
  authenticate,
  validate(pollAnalyticsValidation),
  AnalyticsController.getPollAnalytics
);

router.get(
  "/polls/:pollId/results",
  validate(pollAnalyticsValidation),
  AnalyticsController.getPollResults
);

router.get(
  "/polls/:pollId/chart",
  validate(chartDataValidation),
  AnalyticsController.getChartData
);

router.get(
  "/dashboard",
  authenticate,
  validate(dashboardValidation),
  AnalyticsController.getDashboardAnalytics
);

router.get(
  "/trending",
  validate(trendingValidation),
  AnalyticsController.getTrendingPolls
);

export default router;
