import { z } from "zod";

export const addCommentValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, "Comment must be at least 1 character")
      .max(1000, "Comment must be at most 1000 characters"),
  }),
});

export const getCommentsValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(["newest", "oldest", "most_liked", "pinned"]).optional(),
  }),
});

export const editCommentValidation = z.object({
  params: z.object({
    commentId: z.string().min(1, "Comment ID is required"),
  }),
  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, "Comment must be at least 1 character")
      .max(1000, "Comment must be at most 1000 characters"),
  }),
});

export const deleteCommentValidation = z.object({
  params: z.object({
    commentId: z.string().min(1, "Comment ID is required"),
  }),
});

export const replyValidation = z.object({
  params: z.object({
    commentId: z.string().min(1, "Comment ID is required"),
  }),
  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, "Reply must be at least 1 character")
      .max(1000, "Reply must be at most 1000 characters"),
  }),
});

export const likeValidation = z.object({
  params: z.object({
    commentId: z.string().min(1, "Comment ID is required"),
  }),
});

export const pinValidation = z.object({
  params: z.object({
    commentId: z.string().min(1, "Comment ID is required"),
  }),
});

export const reportValidation = z.object({
  params: z.object({
    commentId: z.string().min(1, "Comment ID is required"),
  }),
  body: z.object({
    reason: z.enum(["spam", "harassment", "abuse", "hate_speech", "other"]),
  }),
});

export const analyticsValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});
