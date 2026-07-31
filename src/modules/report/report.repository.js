import Report from "../../models/Report.js";

class ReportRepository {
  async createReport(data) {
    return await Report.create(data);
  }

  async findReportById(id) {
    return await Report.findById(id);
  }

  async findUserReport(reporterId, targetType, targetId) {
    return await Report.findOne({ reporterId, targetType, targetId });
  }

  async getReports(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let query = {};

    if (filters.status) query.status = filters.status;
    if (filters.reason) query.reason = filters.reason;
    if (filters.targetType) query.targetType = filters.targetType;
    if (filters.reporterId) query.reporterId = filters.reporterId;
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    const reports = await Report.find(query)
      .populate("reporterId", "name username")
      .populate("reviewedBy", "name username")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    return { reports, total };
  }

  async getUserReports(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const reports = await Report.find({ reporterId: userId })
      .populate("reviewedBy", "name username")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments({ reporterId: userId });

    return { reports, total };
  }

  async updateReportStatus(reportId, updates) {
    return await Report.findByIdAndUpdate(reportId, updates, { new: true });
  }

  async getReportAnalytics() {
    const [
      totalReports,
      pendingReports,
      resolvedReports,
      rejectedReports,
      mostReportedPolls,
      mostReportedUsers,
      mostReportedComments,
      reportsByReason,
      reportsByDate,
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "resolved" }),
      Report.countDocuments({ status: "rejected" }),
      Report.aggregate([
        { $match: { targetType: "poll" } },
        { $group: { _id: "$targetId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Report.aggregate([
        { $match: { targetType: "user" } },
        { $group: { _id: "$targetId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Report.aggregate([
        { $match: { targetType: "comment" } },
        { $group: { _id: "$targetId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Report.aggregate([
        { $group: { _id: "$reason", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Report.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 30 },
      ]),
    ]);

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      rejectedReports,
      mostReportedPolls,
      mostReportedUsers,
      mostReportedComments,
      reportsByReason,
      reportsByDate,
    };
  }
}

export const reportRepository = new ReportRepository();
