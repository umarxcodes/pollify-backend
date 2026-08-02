import { z } from "zod";

export const createReportValidation = z.object({
  body: z.object({
    targetType: z.enum(["poll", "comment", "user"]),
    targetId: z.string().min(1, "Target ID is required"),
    reason: z.enum([
      "spam",
      "harassment",
      "hate_speech",
      "misinformation",
      "inappropriate_content",
      "copyright",
      "fake_account",
      "scam",
      "other",
    ]),
    description: z.string().max(500).optional(),
  }),
});

export const getMyReportsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(["newest", "oldest"]).optional(),
    status: z
      .enum(["pending", "under_review", "resolved", "rejected"])
      .optional(),
  }),
});

export const getReportByIdValidation = z.object({
  params: z.object({
    reportId: z.string().min(1, "Report ID is required"),
  }),
});

export const reviewReportValidation = z.object({
  params: z.object({
    reportId: z.string().min(1, "Report ID is required"),
  }),
  body: z.object({
    adminNotes: z.string().max(500).optional(),
  }),
});

export const resolveReportValidation = z.object({
  params: z.object({
    reportId: z.string().min(1, "Report ID is required"),
  }),
  body: z.object({
    action: z.enum([
      "no_action",
      "delete_poll",
      "delete_comment",
      "suspend_user",
      "warn_user",
      "ban_user",
      "restore_content",
    ]),
    adminNotes: z.string().max(500).optional(),
  }),
});

export const rejectReportValidation = z.object({
  params: z.object({
    reportId: z.string().min(1, "Report ID is required"),
  }),
  body: z.object({
    adminNotes: z.string().max(500).optional(),
  }),
});

export const assignReportValidation = z.object({
  params: z.object({
    reportId: z.string().min(1, "Report ID is required"),
  }),
  body: z.object({
    moderatorId: z.string().min(1, "Moderator ID is required"),
  }),
});

export const bulkUpdateReportsValidation = z.object({
  body: z.object({
    reportIds: z.array(z.string().min(1, "Report ID is required")).min(1, "At least one report ID is required"),
    updates: z.object({
      status: z.enum(["pending", "under_review", "resolved", "rejected"]).optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      assignedTo: z.string().optional(),
      adminNotes: z.string().max(500).optional(),
    }),
  }),
});

export const escalateReportValidation = z.object({
  params: z.object({
    reportId: z.string().min(1, "Report ID is required"),
  }),
});

export const reportAnalyticsValidation = z.object({});
