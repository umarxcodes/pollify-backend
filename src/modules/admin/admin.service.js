import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import { adminRepository } from "./admin.repository.js";

class AdminService {
  async getDashboard() {
    const stats = await adminRepository.getDashboardStats();
    return Response.success(200, stats, "Dashboard stats fetched successfully");
  }

  // Users
  async getUsers(filters = {}, sort = "newest", page = 1, limit = 20) {
    const result = await adminRepository.getUsers(filters, sort, page, limit);
    return Response.success(
      200,
      {
        users: result.users,
        pagination: { page, limit, total: result.total },
      },
      "Users fetched successfully"
    );
  }

  async getUser(id) {
    const user = await adminRepository.getUserById(id);
    if (!user) throw new ApiError(404, "User not found");
    return Response.success(200, { user }, "User fetched successfully");
  }

  async updateUserRole(adminId, id, role) {
    const user = await adminRepository.getUserById(id);
    if (!user) throw new ApiError(404, "User not found");

    if (user.role === "super_admin") {
      throw new ApiError(403, "Cannot change role of super admin");
    }

    const updated = await adminRepository.updateUserRole(id, role);

    await adminRepository.createAuditLog({
      adminId,
      action: "update_user_role",
      targetType: "user",
      targetId: id,
      details: { oldRole: user.role, newRole: role },
    });

    return Response.success(
      200,
      { user: updated },
      "User role updated successfully"
    );
  }

  async suspendUser(adminId, id) {
    const user = await adminRepository.getUserById(id);
    if (!user) throw new ApiError(404, "User not found");

    if (user.role === "super_admin") {
      throw new ApiError(403, "Cannot suspend super admin");
    }

    const updated = await adminRepository.suspendUser(id);

    await adminRepository.createAuditLog({
      adminId,
      action: "suspend_user",
      targetType: "user",
      targetId: id,
      details: { email: user.email },
    });

    return Response.success(
      200,
      { user: updated },
      "User suspended successfully"
    );
  }

  async unsuspendUser(adminId, id) {
    const user = await adminRepository.getUserById(id);
    if (!user) throw new ApiError(404, "User not found");

    const updated = await adminRepository.unsuspendUser(id);

    await adminRepository.createAuditLog({
      adminId,
      action: "unsuspend_user",
      targetType: "user",
      targetId: id,
      details: { email: user.email },
    });

    return Response.success(
      200,
      { user: updated },
      "User unsuspended successfully"
    );
  }

  async deleteUser(adminId, id) {
    const user = await adminRepository.getUserById(id);
    if (!user) throw new ApiError(404, "User not found");

    if (user.role === "super_admin") {
      throw new ApiError(403, "Cannot delete super admin");
    }

    if (user._id.toString() === adminId.toString()) {
      throw new ApiError(403, "Cannot delete yourself");
    }

    await adminRepository.softDeleteUser(id);

    await adminRepository.createAuditLog({
      adminId,
      action: "delete_user",
      targetType: "user",
      targetId: id,
      details: { email: user.email, name: user.name },
    });

    return Response.success(200, null, "User deleted successfully");
  }

  // Polls
  async getPolls(filters = {}, sort = "newest", page = 1, limit = 20) {
    const result = await adminRepository.getPolls(filters, sort, page, limit);
    return Response.success(
      200,
      {
        polls: result.polls,
        pagination: { page, limit, total: result.total },
      },
      "Polls fetched successfully"
    );
  }

  async deletePoll(adminId, pollId) {
    const poll = await adminRepository.deletePoll(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    await adminRepository.createAuditLog({
      adminId,
      action: "delete_poll",
      targetType: "poll",
      targetId: pollId,
      details: { title: poll.title },
    });

    return Response.success(200, null, "Poll deleted successfully");
  }

  async restorePoll(adminId, pollId) {
    const poll = await adminRepository.restorePoll(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    await adminRepository.createAuditLog({
      adminId,
      action: "restore_poll",
      targetType: "poll",
      targetId: pollId,
      details: { title: poll.title },
    });

    return Response.success(200, { poll }, "Poll restored successfully");
  }

  async featurePoll(adminId, pollId) {
    const poll = await adminRepository.featurePoll(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    await adminRepository.createAuditLog({
      adminId,
      action: "feature_poll",
      targetType: "poll",
      targetId: pollId,
      details: { title: poll.title },
    });

    return Response.success(200, { poll }, "Poll featured successfully");
  }

  async closePoll(adminId, pollId) {
    const poll = await adminRepository.closePoll(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    await adminRepository.createAuditLog({
      adminId,
      action: "close_poll",
      targetType: "poll",
      targetId: pollId,
      details: { title: poll.title },
    });

    return Response.success(200, { poll }, "Poll closed successfully");
  }

  // Comments
  async getComments(filters = {}, sort = "newest", page = 1, limit = 20) {
    const result = await adminRepository.getComments(
      filters,
      sort,
      page,
      limit
    );
    return Response.success(
      200,
      {
        comments: result.comments,
        pagination: { page, limit, total: result.total },
      },
      "Comments fetched successfully"
    );
  }

  async deleteComment(adminId, commentId) {
    const comment = await adminRepository.deleteComment(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    await adminRepository.createAuditLog({
      adminId,
      action: "delete_comment",
      targetType: "comment",
      targetId: commentId,
    });

    return Response.success(200, null, "Comment deleted successfully");
  }

  async restoreComment(adminId, commentId) {
    const comment = await adminRepository.restoreComment(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    await adminRepository.createAuditLog({
      adminId,
      action: "restore_comment",
      targetType: "comment",
      targetId: commentId,
    });

    return Response.success(200, { comment }, "Comment restored successfully");
  }

  // Categories
  async getCategories(filters = {}, page = 1, limit = 20) {
    const result = await adminRepository.getCategories(filters, page, limit);
    return Response.success(
      200,
      {
        categories: result.categories,
        pagination: { page, limit, total: result.total },
      },
      "Categories fetched successfully"
    );
  }

  async createCategory(adminId, data) {
    const category = await adminRepository.createCategory(data);

    await adminRepository.createAuditLog({
      adminId,
      action: "create_category",
      targetType: "category",
      targetId: category._id,
      details: { name: category.name },
    });

    return Response.success(201, { category }, "Category created successfully");
  }

  async updateCategory(adminId, id, data) {
    const category = await adminRepository.updateCategory(id, data);
    if (!category) throw new ApiError(404, "Category not found");

    await adminRepository.createAuditLog({
      adminId,
      action: "update_category",
      targetType: "category",
      targetId: id,
      details: { name: category.name },
    });

    return Response.success(200, { category }, "Category updated successfully");
  }

  async deleteCategory(adminId, id) {
    const category = await adminRepository.deleteCategory(id);
    if (!category) throw new ApiError(404, "Category not found");

    await adminRepository.createAuditLog({
      adminId,
      action: "delete_category",
      targetType: "category",
      targetId: id,
      details: { name: category.name },
    });

    return Response.success(200, null, "Category deleted successfully");
  }

  async restoreCategory(adminId, id) {
    const category = await adminRepository.restoreCategory(id);
    if (!category) throw new ApiError(404, "Category not found");

    await adminRepository.createAuditLog({
      adminId,
      action: "restore_category",
      targetType: "category",
      targetId: id,
      details: { name: category.name },
    });

    return Response.success(
      200,
      { category },
      "Category restored successfully"
    );
  }

  // Notifications
  async createNotification(adminId, data) {
    const notification = await adminRepository.createSystemNotification({
      ...data,
      senderId: adminId,
    });

    await adminRepository.createAuditLog({
      adminId,
      action: "create_notification",
      targetType: "notification",
      targetId: notification._id,
      details: { title: data.title, type: data.type },
    });

    return Response.success(
      201,
      { notification },
      "Notification created successfully"
    );
  }

  async broadcastNotification(adminId, data) {
    const result = await adminRepository.broadcastNotification({
      ...data,
      senderId: adminId,
    });

    await adminRepository.createAuditLog({
      adminId,
      action: "broadcast_notification",
      targetType: "notification",
      details: { title: data.title, recipientsCount: result.length },
    });

    return Response.success(
      200,
      { sentCount: result.length },
      "Notification broadcasted successfully"
    );
  }

  // Analytics
  async getAnalytics() {
    const analytics = await adminRepository.getAnalytics();
    return Response.success(200, analytics, "Analytics fetched successfully");
  }

  // Audit Logs
  async getAuditLogs(filters = {}, page = 1, limit = 20) {
    const result = await adminRepository.getAuditLogs(filters, page, limit);
    return Response.success(
      200,
      {
        logs: result.logs,
        pagination: { page, limit, total: result.total },
      },
      "Audit logs fetched successfully"
    );
  }

  // Settings
  async updateSettings(adminId, settings) {
    await adminRepository.createAuditLog({
      adminId,
      action: "update_system_settings",
      targetType: "system",
      details: { settings },
    });

    return Response.success(200, settings, "Settings updated successfully");
  }
}

export const adminService = new AdminService();
