import { analyticsService } from "./analytics.service.js";

class AnalyticsController {
  static async getPollAnalytics(req, res, next) {
    try {
      const result = await analyticsService.getPollAnalytics(
        req.params.pollId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPollResults(req, res, next) {
    try {
      const result = await analyticsService.getPollResults(req.params.pollId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getChartData(req, res, next) {
    try {
      const result = await analyticsService.getChartData(req.params.pollId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardAnalytics(req, res, next) {
    try {
      const result = await analyticsService.getDashboardAnalytics(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getTrendingPolls(req, res, next) {
    try {
      const result = await analyticsService.getTrendingPolls();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AnalyticsController;
