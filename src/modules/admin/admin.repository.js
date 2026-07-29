import User from "../../models/User.js";
import Poll from "../../models/Poll.js";
import Comment from "../../models/Comment.js";
import Category from "../../models/Category.js";
import Report from "../../models/Report.js";
import AuditLog from "../../models/AuditLog.js";
import Notification from "../../models/Notification.js";
import Bookmark from "../../models/Bookmark.js";
import Vote from "../../models/Vote.js";

class AdminRepository {
  // Dashboard
  async getDashboardStats() {
    const [
      totalUsers,
      verifiedUsers,
      activeUsers,
      totalPolls,
      activePolls,
      expiredPolls,
      draftPolls,
      totalVotes,
      totalComments,
      totalBookmarks,
      pendingReports,
      totalCategories,
      notificationsSent,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isActive: true }),
      Poll.countDocuments(),
      Poll.countDocuments({ status: "active" }),
      Poll.countDocuments({ status: "expired" }),
      Poll.countDocuments({ status: "draft" }),
      Vote.countDocuments(),
      Comment.countDocuments({ isDeleted: false }),
      Bookmark.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Category.countDocuments({ isActive: true }),
      Notification.countDocuments(),
    ]);

    return {
      totalUsers,
      verifiedUsers,
      activeUsers,
      totalPolls,
      activePolls,
      expiredPolls,
      draftPolls,
      totalVotes,
      totalComments,
      totalBookmarks,
      pendingReports,
      totalCategories,
      notificationsSent,
    };
  }

  // Users
  async getUsers(filters = {}, sort = "newest", page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let query = {};

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { username: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.role) query.role = filters.role;
    if (filters.isVerified !== undefined)
      query.isVerified = filters.isVerified === "true";
    if (filters.isSuspended !== undefined)
      query.isSuspended = filters.isSuspended === "true";

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "name") sortOption = { name: 1 };

    const users = await User.find(query)
      .select(
        "name username email role isVerified isSuspended createdAt lastActive"
      )
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const total = await User.countDocuments(query);

    return { users, total };
  }

  async getUserById(id) {
    return await User.findById(id).select(
      "name username email role isVerified isSuspended createdAt lastActive loginActivity"
    );
  }

  async updateUserRole(userId, role) {
    return await User.findByIdAndUpdate(userId, { role }, { new: true }).select(
      "name username email role"
    );
  }

  async suspendUser(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { isSuspended: true },
      { new: true }
    ).select("name username email role isSuspended");
  }

  async unsuspendUser(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { isSuspended: false },
      { new: true }
    ).select("name username email role isSuspended");
  }

  async softDeleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }

  // Polls
  async getPolls(filters = {}, sort = "newest", page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let query = {};

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.status) query.status = filters.status;

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "most_voted") sortOption = { totalVotes: -1 };
    else if (sort === "most_commented") sortOption = { commentsCount: -1 };

    const polls = await Poll.find(query)
      .populate("createdBy", "name username")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const total = await Poll.countDocuments(query);

    return { polls, total };
  }

  async deletePoll(pollId) {
    return await Poll.findByIdAndUpdate(
      pollId,
      { status: "deleted" },
      { new: true }
    );
  }

  async restorePoll(pollId) {
    return await Poll.findByIdAndUpdate(
      pollId,
      { status: "active" },
      { new: true }
    );
  }

  async featurePoll(pollId) {
    return await Poll.findByIdAndUpdate(
      pollId,
      { isFeatured: true },
      { new: true }
    );
  }

  async closePoll(pollId) {
    return await Poll.findByIdAndUpdate(
      pollId,
      { status: "closed", expiresAt: new Date() },
      { new: true }
    );
  }

  // Comments
  async getComments(filters = {}, sort = "newest", page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let query = {};

    if (filters.search) {
      query.content = { $regex: filters.search, $options: "i" };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "most_liked") sortOption = { likesCount: -1 };

    const comments = await Comment.find(query)
      .populate("userId", "name username")
      .populate("pollId", "title")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const total = await Comment.countDocuments(query);

    return { comments, total };
  }

  async deleteComment(commentId) {
    return await Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: true, content: "This comment has been deleted." },
      { new: true }
    );
  }

  async restoreComment(commentId) {
    return await Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: false },
      { new: true }
    );
  }

  // Categories
  async getCategories(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let query = {};

    if (filters.search) {
      query.name = { $regex: filters.search, $options: "i" };
    }

    const categories = await Category.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Category.countDocuments(query);

    return { categories, total };
  }

  async createCategory(data) {
    return await Category.create(data);
  }

  async updateCategory(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCategory(id) {
    return await Category.findByIdAndDelete(id);
  }

  async restoreCategory(id) {
    return await Category.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
  }

  // Analytics
  async getAnalytics() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      dailyRegistrations,
      dailyVotes,
      dailyComments,
      monthlyGrowth,
      mostActiveUsers,
      mostPopularPolls,
      topCategories,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Vote.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Comment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.find()
        .sort({ loginActivity: -1 })
        .limit(10)
        .select("name username lastActive"),
      Poll.find()
        .sort({ totalVotes: -1 })
        .limit(10)
        .populate("createdBy", "name username")
        .select("title totalVotes createdAt"),
      Poll.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalVotes: { $sum: "$totalVotes" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      dailyRegistrations,
      dailyVotes,
      dailyComments,
      monthlyGrowth,
      mostActiveUsers,
      mostPopularPolls,
      topCategories,
    };
  }

  // Audit Logs
  async createAuditLog(data) {
    return await AuditLog.create(data);
  }

  async getAuditLogs(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let query = {};

    if (filters.action)
      query.action = { $regex: filters.action, $options: "i" };
    if (filters.targetType) query.targetType = filters.targetType;
    if (filters.adminId) query.adminId = filters.adminId;

    const logs = await AuditLog.find(query)
      .populate("adminId", "name username")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(query);

    return { logs, total };
  }

  // Notifications
  async createSystemNotification(data) {
    return await Notification.create(data);
  }

  async broadcastNotification(data) {
    const users = await User.find({ isSuspended: false }).select("_id");
    const notifications = users.map((user) => ({
      ...data,
      recipientId: user._id,
      senderId: data.senderId,
    }));
    return await Notification.insertMany(notifications);
  }
}

export const adminRepository = new AdminRepository();
