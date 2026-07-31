import { ApiError } from "../../utils/apiError.js";
import { Response } from "../../utils/response.js";
import Notification from "../../models/Notification.js";
import { notificationRepository } from "./notification.repository.js";
import { mailService } from "../../services/mail.service.js";
import { passwordChangedEmail } from "../../services/mail.templates.js";
import logger from "../../utils/logger.js";

class NotificationService {
  async create(
    recipientId,
    senderId,
    type,
    title,
    message,
    entityType = null,
    entityId = null,
    metadata = {}
  ) {
    const preferences =
      await notificationRepository.getUserNotificationPreferences(recipientId);
    const canSend = this.shouldSendNotification(type, preferences);

    const notification = await notificationRepository.createNotification({
      recipientId,
      senderId,
      type,
      title,
      message,
      entityType,
      entityId,
      metadata,
    });

    // Email notifications for auth-related events
    if (
      canSend &&
      [
        "WELCOME",
        "EMAIL_VERIFIED",
        "PASSWORD_CHANGED",
        "PASSWORD_RESET",
      ].includes(type)
    ) {
      await this.sendEmailNotification(
        recipientId,
        type,
        title,
        message,
        metadata
      ).catch((err) => {
        logger.error(
          { err, type, recipientId },
          `Failed to send email notification for ${type}`
        );
      });
    }

    return notification;
  }

  shouldSendNotification(type, preferences) {
    if (!preferences || Object.keys(preferences).length === 0) return true;

    const typeToPreference = {
      WELCOME: "marketingNotifications",
      EMAIL_VERIFIED: "emailNotifications",
      PASSWORD_CHANGED: "emailNotifications",
      PASSWORD_RESET: "emailNotifications",
      POLL_CREATED: "pollNotifications",
      POLL_UPDATED: "pollNotifications",
      POLL_DELETED: "pollNotifications",
      POLL_EXPIRING: "pollNotifications",
      POLL_CLOSED: "pollNotifications",
      NEW_VOTE: "voteNotifications",
      NEW_COMMENT: "commentNotifications",
      COMMENT_REPLY: "commentNotifications",
      COMMENT_LIKED: "commentNotifications",
      COMMENT_PINNED: "commentNotifications",
      BOOKMARK: "pollNotifications",
      REPORT_UPDATED: "emailNotifications",
      SYSTEM: "systemNotifications",
    };

    const preferenceKey = typeToPreference[type];
    if (!preferenceKey) return true;
    return preferences[preferenceKey] !== false;
  }

  async sendEmailNotification(recipientId, type, title, message, _metadata) {
    try {
      const user = await notificationRepository.getUserById(recipientId);
      if (!user?.email) return;

      let emailOptions;
      switch (type) {
        case "WELCOME":
          emailOptions = {
            to: user.email,
            subject: "Welcome to Pollify!",
            text: message,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px"><h2 style="color:#2563eb">Welcome to Pollify!</h2><p>${message}</p><p style="color:#6b7280;font-size:13px">Pollify Team</p></div>`,
          };
          break;
        case "PASSWORD_CHANGED":
          emailOptions = passwordChangedEmail(user.name);
          emailOptions.to = user.email;
          break;
        default:
          emailOptions = {
            to: user.email,
            subject: title,
            text: message,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px"><h2 style="color:#2563eb">${title}</h2><p>${message}</p><p style="color:#6b7280;font-size:13px">Pollify Team</p></div>`,
          };
      }

      await mailService.sendMail(emailOptions);
    } catch (error) {
      console.error("Email notification failed:", error);
      throw new ApiError(500, "Failed to send email notification");
    }
  }

  async getNotifications(
    recipientId,
    page = 1,
    limit = 20,
    sort = "newest",
    filter = {}
  ) {
    let query = { recipientId };

    if (filter.read !== undefined) {
      query.isRead = filter.read === "true";
    }

    if (filter.type) {
      query.type = filter.type;
    }

    const skip = (page - 1) * limit;
    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "unread_first") {
      sortOption = { isRead: 1, createdAt: -1 };
    }

    const notifications = await Notification.find(query)
      .populate("senderId", "name username profileImage")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const total = await Notification.countDocuments(query);

    return Response.success(
      200,
      {
        notifications,
        pagination: { page, limit, total },
      },
      "Notifications fetched successfully"
    );
  }

  async getNotificationById(notificationId, recipientId) {
    const notification =
      await notificationRepository.findNotificationById(notificationId);
    if (!notification) throw new ApiError(404, "Notification not found");
    if (notification.recipientId.toString() !== recipientId.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to view this notification"
      );
    }
    return Response.success(
      200,
      { notification },
      "Notification fetched successfully"
    );
  }

  async markAsRead(notificationId, recipientId) {
    const notification =
      await notificationRepository.findNotificationById(notificationId);
    if (!notification) throw new ApiError(404, "Notification not found");
    if (notification.recipientId.toString() !== recipientId.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to update this notification"
      );
    }

    const updated = await notificationRepository.updateNotification(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return Response.success(
      200,
      { notification: updated },
      "Notification marked as read"
    );
  }

  async markAllAsRead(recipientId) {
    await Notification.updateMany(
      { recipientId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return Response.success(200, null, "All notifications marked as read");
  }

  async deleteNotification(notificationId, recipientId) {
    const notification =
      await notificationRepository.findNotificationById(notificationId);
    if (!notification) throw new ApiError(404, "Notification not found");
    if (notification.recipientId.toString() !== recipientId.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to delete this notification"
      );
    }

    await notificationRepository.deleteNotification(notificationId);
    return Response.success(200, null, "Notification deleted successfully");
  }

  async deleteAllNotifications(recipientId) {
    await notificationRepository.deleteNotificationsByRecipient(recipientId);
    return Response.success(
      200,
      null,
      "All notifications deleted successfully"
    );
  }

  async getUnreadCount(recipientId) {
    const count = await notificationRepository.getUnreadCount(recipientId);
    return Response.success(
      200,
      { count },
      "Unread count fetched successfully"
    );
  }

  async updateNotificationPreferences(userId, preferences) {
    const updated =
      await notificationRepository.updateUserNotificationPreferences(
        userId,
        preferences
      );
    return Response.success(
      200,
      { preferences: updated },
      "Notification preferences updated successfully"
    );
  }

  async getNotificationPreferences(userId) {
    const preferences =
      await notificationRepository.getUserNotificationPreferences(userId);
    return Response.success(
      200,
      { preferences },
      "Notification preferences fetched successfully"
    );
  }

  // Socket.IO ready: this method can be called from other services
  async emitToUser(userId, event, data) {
    // Future: emit socket event to user
    console.log(`Socket emit to user ${userId}: ${event}`, data);
  }
}

export const notificationService = new NotificationService();
