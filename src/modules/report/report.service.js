import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { reportRepository } from "./report.repository.js";
import { notificationService } from "../notification/notification.service.js";
import { adminRepository } from "../admin/admin.repository.js";
import User from "../../models/User.js";
import Poll from "../../models/Poll.js";
import Comment from "../../models/Comment.js";

class ReportService {
  async createReport(
    reporterId,
    targetType,
    targetId,
    reason,
    description = ""
  ) {
    const existingReport = await reportRepository.findUserReport(
      reporterId,
      targetType,
      targetId
    );
    if (existingReport) {
      throw new ApiError(409, "You have already reported this content");
    }

    if (targetType === "poll") {
      const poll = await Poll.findById(targetId);
      if (!poll) throw new ApiError(404, "Poll not found");
      if (poll.createdBy.toString() === reporterId.toString()) {
        throw new ApiError(403, "You cannot report your own content");
      }
    } else if (targetType === "comment") {
      const comment = await Comment.findById(targetId);
      if (!comment) throw new ApiError(404, "Comment not found");
      if (comment.userId.toString() === reporterId.toString()) {
        throw new ApiError(403, "You cannot report your own content");
      }
    } else if (targetType === "user") {
      if (targetId.toString() === reporterId.toString()) {
        throw new ApiError(403, "You cannot report yourself");
      }
      const user = await User.findById(targetId);
      if (!user) throw new ApiError(404, "User not found");
    }

    const report = await reportRepository.createReport({
      reporterId,
      targetType,
      targetId,
      reason,
      description,
    });

    return Response.success(201, { report }, "Report submitted successfully");
  }

  async getMyReports(userId, page = 1, limit = 20) {
    const result = await reportRepository.getUserReports(userId, page, limit);
    return Response.success(
      200,
      {
        reports: result.reports,
        pagination: { page, limit, total: result.total },
      },
      "Your reports fetched successfully"
    );
  }

  async getReportById(reportId, userId) {
    const report = await reportRepository.findReportById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    const isAdmin = await this.isAdmin(userId);
    if (report.reporterId.toString() !== userId.toString() && !isAdmin) {
      throw new ApiError(403, "You are not authorized to view this report");
    }

    return Response.success(200, { report }, "Report fetched successfully");
  }

  async reviewReport(adminId, reportId, adminNotes = "") {
    const report = await reportRepository.findReportById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    const updated = await reportRepository.updateReportStatus(reportId, {
      status: "under_review",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminNotes,
    });

    await adminRepository.createAuditLog({
      adminId,
      action: "review_report",
      targetType: "report",
      targetId: reportId,
      details: { reason: report.reason, targetType: report.targetType },
    });

    return Response.success(
      200,
      { report: updated },
      "Report marked as under review"
    );
  }

  async resolveReport(adminId, reportId, action, adminNotes = "") {
    const report = await reportRepository.findReportById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    const updated = await reportRepository.updateReportStatus(reportId, {
      status: "resolved",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminNotes,
      moderationAction: action,
    });

    await this.executeModerationAction(report, action);

    await adminRepository.createAuditLog({
      adminId,
      action: "resolve_report",
      targetType: "report",
      targetId: reportId,
      details: { action, reason: report.reason, targetType: report.targetType },
    });

    return Response.success(
      200,
      { report: updated },
      "Report resolved successfully"
    );
  }

  async rejectReport(adminId, reportId, adminNotes = "") {
    const report = await reportRepository.findReportById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    const updated = await reportRepository.updateReportStatus(reportId, {
      status: "rejected",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminNotes,
    });

    await adminRepository.createAuditLog({
      adminId,
      action: "reject_report",
      targetType: "report",
      targetId: reportId,
      details: { reason: report.reason, targetType: report.targetType },
    });

    return Response.success(
      200,
      { report: updated },
      "Report rejected successfully"
    );
  }

  async assignReport(adminId, reportId, moderatorId) {
    const report = await reportRepository.findReportById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    const updated = await reportRepository.assignReport(reportId, moderatorId);

    await adminRepository.createAuditLog({
      adminId,
      action: "assign_report",
      targetType: "report",
      targetId: reportId,
      details: { assignedTo: moderatorId },
    });

    return Response.success(
      200,
      { report: updated },
      "Report assigned successfully"
    );
  }

  async bulkUpdateReports(adminId, reportIds, updates) {
    const reports = await reportRepository.bulkUpdateReports(reportIds, updates);

    await adminRepository.createAuditLog({
      adminId,
      action: "bulk_update_reports",
      targetType: "report",
      targetId: reportIds[0],
      details: { count: reportIds.length, updates },
    });

    return Response.success(
      200,
      { modifiedCount: reports.modifiedCount },
      "Reports updated successfully"
    );
  }

  async getModerationStats() {
    const analytics = await reportRepository.getReportAnalytics();
    return Response.success(
      200,
      analytics,
      "Moderation stats fetched successfully"
    );
  }

  async escalateReport(adminId, reportId) {
    const report = await reportRepository.findReportById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    const updated = await reportRepository.updateReportStatus(reportId, {
      escalated: true,
      escalatedAt: new Date(),
      escalatedBy: adminId,
      priority: "critical",
    });

    await adminRepository.createAuditLog({
      adminId,
      action: "escalate_report",
      targetType: "report",
      targetId: reportId,
      details: { reason: report.reason, targetType: report.targetType },
    });

    return Response.success(
      200,
      { report: updated },
      "Report escalated successfully"
    );
  }

  async getReportAnalytics() {
    const analytics = await reportRepository.getReportAnalytics();
    return Response.success(
      200,
      analytics,
      "Report analytics fetched successfully"
    );
  }

  async isAdmin(userId) {
    const user = await User.findById(userId);
    return user && ["admin", "super_admin"].includes(user.role);
  }

  async executeModerationAction(report, action) {
    switch (action) {
      case "delete_poll":
        if (report.targetType === "poll") {
          await Poll.findByIdAndUpdate(report.targetId, { status: "deleted" });
        }
        break;
      case "delete_comment":
        if (report.targetType === "comment") {
          await Comment.findByIdAndUpdate(report.targetId, {
            isDeleted: true,
            content: "This comment has been deleted.",
          });
        }
        break;
      case "suspend_user":
        if (report.targetType === "user") {
          await User.findByIdAndUpdate(report.targetId, { isSuspended: true });
        }
        break;
      case "warn_user":
        if (report.targetType === "user") {
          await notificationService.create(
            report.targetId,
            null,
            "SYSTEM",
            "Account Warning",
            "You have received a warning for violating community guidelines.",
            "user",
            report.targetId
          );
        }
        break;
      case "ban_user":
        if (report.targetType === "user") {
          await User.findByIdAndUpdate(report.targetId, { isSuspended: true });
        }
        break;
      case "restore_content":
        if (report.targetType === "poll") {
          await Poll.findByIdAndUpdate(report.targetId, { status: "active" });
        } else if (report.targetType === "comment") {
          await Comment.findByIdAndUpdate(report.targetId, {
            isDeleted: false,
          });
        }
        break;
      default:
        break;
    }
  }
}

export const reportService = new ReportService();
