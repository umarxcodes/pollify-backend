import { notificationService } from "./notification.service.js";

class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const sort = req.query.sort || "newest";
      const filter = {
        read: req.query.read,
        type: req.query.type,
      };
      const result = await notificationService.getNotifications(
        req.user.id,
        page,
        limit,
        sort,
        filter
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getNotificationById(req, res, next) {
    try {
      const result = await notificationService.getNotificationById(
        req.params.notificationId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(
        req.params.notificationId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req, res, next) {
    try {
      const result = await notificationService.deleteNotification(
        req.params.notificationId,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAllNotifications(req, res, next) {
    try {
      const result = await notificationService.deleteAllNotifications(
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req, res, next) {
    try {
      const result = await notificationService.getUnreadCount(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req, res, next) {
    try {
      const result = await notificationService.updateNotificationPreferences(
        req.user.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPreferences(req, res, next) {
    try {
      const result = await notificationService.getNotificationPreferences(
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
