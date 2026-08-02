import { adminService } from "./admin.service.js";

class AdminController {
  static async getDashboard(req, res, next) {
    try {
      const result = await adminService.getDashboard();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const result = await adminService.getUsers(
        req.query,
        req.query.sort || "newest",
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req, res, next) {
    try {
      const result = await adminService.getUser(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const result = await adminService.updateUserRole(
        req.user.id,
        req.params.id,
        req.body.role
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async suspendUser(req, res, next) {
    try {
      const result = await adminService.suspendUser(req.user.id, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unsuspendUser(req, res, next) {
    try {
      const result = await adminService.unsuspendUser(
        req.user.id,
        req.params.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const result = await adminService.deleteUser(req.user.id, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPolls(req, res, next) {
    try {
      const result = await adminService.getPolls(
        req.query,
        req.query.sort || "newest",
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deletePoll(req, res, next) {
    try {
      const result = await adminService.deletePoll(
        req.user.id,
        req.params.pollId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async restorePoll(req, res, next) {
    try {
      const result = await adminService.restorePoll(
        req.user.id,
        req.params.pollId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async featurePoll(req, res, next) {
    try {
      const result = await adminService.featurePoll(
        req.user.id,
        req.params.pollId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async closePoll(req, res, next) {
    try {
      const result = await adminService.closePoll(
        req.user.id,
        req.params.pollId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getComments(req, res, next) {
    try {
      const result = await adminService.getComments(
        req.query,
        req.query.sort || "newest",
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req, res, next) {
    try {
      const result = await adminService.deleteComment(
        req.user.id,
        req.params.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async restoreComment(req, res, next) {
    try {
      const result = await adminService.restoreComment(
        req.user.id,
        req.params.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getReports(req, res, next) {
    try {
      const result = await adminService.getReports(
        req.query,
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getReport(req, res, next) {
    try {
      const result = await adminService.getReport(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async reviewReport(req, res, next) {
    try {
      const result = await adminService.reviewReport(
        req.user.id,
        req.params.id,
        req.body.adminNotes || ""
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resolveReport(req, res, next) {
    try {
      const result = await adminService.resolveReport(
        req.user.id,
        req.params.id,
        req.body.adminNotes || ""
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async rejectReport(req, res, next) {
    try {
      const result = await adminService.rejectReport(
        req.user.id,
        req.params.id,
        req.body.adminNotes || ""
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async assignReport(req, res, next) {
    try {
      const result = await adminService.assignReport(
        req.user.id,
        req.params.id,
        req.body.moderatorId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async escalateReport(req, res, next) {
    try {
      const result = await adminService.escalateReport(
        req.user.id,
        req.params.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async bulkUpdateReports(req, res, next) {
    try {
      const result = await adminService.bulkUpdateReports(
        req.user.id,
        req.body.reportIds,
        req.body.updates
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getModerationStats(req, res, next) {
    try {
      const result = await adminService.getModerationStats();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req, res, next) {
    try {
      const result = await adminService.getNotifications(
        req.query,
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const result = await adminService.getCategories(
        req.query,
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const result = await adminService.createCategory(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const result = await adminService.updateCategory(
        req.user.id,
        req.params.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const result = await adminService.deleteCategory(
        req.user.id,
        req.params.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async restoreCategory(req, res, next) {
    try {
      const result = await adminService.restoreCategory(
        req.user.id,
        req.params.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createNotification(req, res, next) {
    try {
      const result = await adminService.createNotification(
        req.user.id,
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async broadcastNotification(req, res, next) {
    try {
      const result = await adminService.broadcastNotification(
        req.user.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req, res, next) {
    try {
      const result = await adminService.getAnalytics();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req, res, next) {
    try {
      const result = await adminService.getAuditLogs(
        req.query,
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 20
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async exportAuditLogs(req, res, next) {
    try {
      const result = await adminService.exportAuditLogs(req.query);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=audit-logs-${Date.now()}.csv`
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const result = await adminService.updateSettings(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;
