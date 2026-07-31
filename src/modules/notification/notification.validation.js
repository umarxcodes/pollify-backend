import { z } from "zod";

export const getNotificationsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(["newest", "oldest", "unread_first"]).optional(),
    read: z.enum(["true", "false"]).optional(),
    type: z
      .enum([
        "WELCOME",
        "EMAIL_VERIFIED",
        "PASSWORD_CHANGED",
        "PASSWORD_RESET",
        "POLL_CREATED",
        "POLL_UPDATED",
        "POLL_DELETED",
        "POLL_EXPIRING",
        "POLL_CLOSED",
        "NEW_VOTE",
        "NEW_COMMENT",
        "COMMENT_REPLY",
        "COMMENT_LIKED",
        "COMMENT_PINNED",
        "BOOKMARK",
        "REPORT_UPDATED",
        "SYSTEM",
      ])
      .optional(),
  }),
});

export const getNotificationByIdValidation = z.object({
  params: z.object({
    notificationId: z.string().min(1, "Notification ID is required"),
  }),
});

export const markAsReadValidation = z.object({
  params: z.object({
    notificationId: z.string().min(1, "Notification ID is required"),
  }),
});

export const markAllAsReadValidation = z.object({});

export const deleteNotificationValidation = z.object({
  params: z.object({
    notificationId: z.string().min(1, "Notification ID is required"),
  }),
});

export const deleteAllNotificationsValidation = z.object({});

export const updatePreferencesValidation = z.object({
  body: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    voteNotifications: z.boolean().optional(),
    commentNotifications: z.boolean().optional(),
    pollNotifications: z.boolean().optional(),
    systemNotifications: z.boolean().optional(),
    marketingNotifications: z.boolean().optional(),
  }),
});
