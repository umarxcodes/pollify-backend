import { ApiError } from "../../utils/apiError.js";

export const checkReportOwnership = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const Report = (await import("../../models/Report.js")).default;
    const report = await Report.findById(reportId);

    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    if (report.reporterId.toString() !== req.user.id.toString()) {
      const User = (await import("../../models/User.js")).default;
      const user = await User.findById(req.user.id);
      if (!user || !["admin", "super_admin"].includes(user.role)) {
        throw new ApiError(403, "You are not authorized to access this report");
      }
    }

    req.report = report;
    next();
  } catch (error) {
    next(error);
  }
};

export const toLowerCaseEnum = (req, res, next) => {
  if (req.body.targetType) {
    req.body.targetType = req.body.targetType.toLowerCase();
  }
  if (req.body.reason) {
    req.body.reason = req.body.reason.toLowerCase();
  }
  if (req.body.action) {
    req.body.action = req.body.action.toLowerCase();
  }
  next();
};
