import { z } from "zod";

export const dashboardValidation = z.object({});

export const getUsersValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(["newest", "oldest", "name"]).optional(),
    search: z.string().optional(),
    role: z.enum(["user", "admin", "moderator", "super_admin"]).optional(),
    isVerified: z.enum(["true", "false"]).optional(),
    isSuspended: z.enum(["true", "false"]).optional(),
  }),
});

export const getUserValidation = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
});

export const updateUserRoleValidation = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    role: z.enum(["user", "admin", "moderator", "super_admin"]),
  }),
});

export const suspendUserValidation = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
});

export const deleteUserValidation = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
});

export const getPollsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z
      .enum(["newest", "oldest", "most_voted", "most_commented"])
      .optional(),
    status: z.enum(["draft", "active", "expired", "deleted"]).optional(),
    search: z.string().optional(),
  }),
});

export const pollActionValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const getCommentsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(["newest", "oldest", "most_liked"]).optional(),
    search: z.string().optional(),
  }),
});

export const commentActionValidation = z.object({
  params: z.object({
    id: z.string().min(1, "Comment ID is required"),
  }),
});

export const categoriesValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const categoryIdValidation = z.object({
  params: z.object({
    id: z.string().min(1, "Category ID is required"),
  }),
});

export const getReportsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).optional(),
    targetType: z.enum(["poll", "comment", "user"]).optional(),
  }),
});

export const reportActionValidation = z.object({
  params: z.object({
    id: z.string().min(1, "Report ID is required"),
  }),
  body: z.object({
    status: z.enum(["reviewed", "resolved", "dismissed"]),
    adminNotes: z.string().max(500).optional(),
  }),
});

export const createNotificationValidation = z.object({
  body: z.object({
    recipientId: z.string().min(1, "Recipient ID is required"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be at most 200 characters"),
    message: z
      .string()
      .min(1, "Message is required")
      .max(1000, "Message must be at most 1000 characters"),
    type: z.enum([
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
    ]),
    entityType: z
      .enum(["poll", "comment", "vote", "user", "system"])
      .optional(),
    entityId: z.string().optional(),
  }),
});

export const getAuditLogsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    action: z.string().optional(),
    targetType: z
      .enum([
        "user",
        "poll",
        "comment",
        "category",
        "report",
        "system",
        "notification",
      ])
      .optional(),
    adminId: z.string().optional(),
  }),
});

export const getAnalyticsValidation = z.object({});

export const updateSettingsValidation = z.object({
  body: z.object({
    maintenanceMode: z.boolean().optional(),
    registrationEnabled: z.boolean().optional(),
    votingEnabled: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
    notificationEnabled: z.boolean().optional(),
  }),
});

export const getNotificationsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.string().optional(),
    read: z.enum(["true", "false"]).optional(),
    search: z.string().optional(),
  }),
});
