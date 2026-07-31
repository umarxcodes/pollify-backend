import { ApiError } from "../../utils/apiError.js";

export const checkNotificationOwnership = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const Notification = (await import("../../models/Notification.js")).default;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    if (notification.recipientId.toString() !== req.user.id.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to access this notification"
      );
    }

    req.notification = notification;
    next();
  } catch (error) {
    next(error);
  }
};
