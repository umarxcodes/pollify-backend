import { reportService } from "./report.service.js";

class ReportController {
  static async createReport(req, res, next) {
    try {
      const result = await reportService.createReport(
        req.user.id,
        req.body.targetType,
        req.body.targetId,
        req.body.reason,
        req.body.description || ""
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMyReports(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await reportService.getMyReports(req.user.id, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getReportById(req, res, next) {
    try {
      const result = await reportService.getReportById(
        req.params.reportId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async reviewReport(req, res, next) {
    try {
      const result = await reportService.reviewReport(
        req.user.id,
        req.params.reportId,
        req.body.adminNotes || ""
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resolveReport(req, res, next) {
    try {
      const result = await reportService.resolveReport(
        req.user.id,
        req.params.reportId,
        req.body.action,
        req.body.adminNotes || ""
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async rejectReport(req, res, next) {
    try {
      const result = await reportService.rejectReport(
        req.user.id,
        req.params.reportId,
        req.body.adminNotes || ""
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async assignReport(req, res, next) {
    try {
      const result = await reportService.assignReport(
        req.user.id,
        req.params.reportId,
        req.body.moderatorId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async bulkUpdateReports(req, res, next) {
    try {
      const result = await reportService.bulkUpdateReports(
        req.user.id,
        req.body.reportIds,
        req.body.updates
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async escalateReport(req, res, next) {
    try {
      const result = await reportService.escalateReport(
        req.user.id,
        req.params.reportId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getReportAnalytics(req, res, next) {
    try {
      const result = await reportService.getReportAnalytics();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getModerationStats(req, res, next) {
    try {
      const result = await reportService.getModerationStats();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default ReportController;
