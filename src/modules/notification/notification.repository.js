import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import Poll from "../../models/Poll.js";
import Comment from "../../models/Comment.js";

class NotificationRepository {
  async createNotification(data) {
    return await Notification.create(data);
  }

  async findNotificationById(id) {
    return await Notification.findById(id);
  }

  async findNotificationsByRecipient(
    recipientId,
    page = 1,
    limit = 20,
    sort = "newest"
  ) {
    const skip = (page - 1) * limit;
    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "unread_first") {
      sortOption = { isRead: 1, createdAt: -1 };
    }

    return await Notification.find({ recipientId })
      .populate("senderId", "name username profileImage")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);
  }

  async countNotificationsByRecipient(recipientId, filter = {}) {
    const query = { recipientId, ...filter };
    return await Notification.countDocuments(query);
  }

  async updateNotification(id, updates) {
    return await Notification.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteNotification(id) {
    return await Notification.findByIdAndDelete(id);
  }

  async deleteNotificationsByRecipient(recipientId) {
    return await Notification.deleteMany({ recipientId });
  }

  async deleteNotificationsByEntity(entityType, entityId) {
    return await Notification.deleteMany({ entityType, entityId });
  }

  async getUserNotificationPreferences(userId) {
    const user = await User.findById(userId).select("notificationPreferences");
    return user?.notificationPreferences || {};
  }

  async updateUserNotificationPreferences(userId, preferences) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { notificationPreferences: preferences } },
      { new: true }
    ).select("notificationPreferences");
  }

  async getUnreadCount(recipientId) {
    return await Notification.countDocuments({ recipientId, isRead: false });
  }

  async getPollById(pollId) {
    return await Poll.findById(pollId).select("title status createdBy");
  }

  async getCommentById(commentId) {
    return await Comment.findById(commentId).select("content userId");
  }

  async getUserById(userId) {
    return await User.findById(userId).select("name username email");
  }
}

export const notificationRepository = new NotificationRepository();
