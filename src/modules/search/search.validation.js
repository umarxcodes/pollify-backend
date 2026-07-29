import { z } from "zod";

export const globalSearchValidation = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
  }),
});

export const searchPollsValidation = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z
      .enum(["newest", "oldest", "most_voted", "most_commented", "trending"])
      .optional(),
    category: z.string().optional(),
    type: z.enum(["single", "multiple", "anonymous"]).optional(),
    minVotes: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});

export const searchUsersValidation = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const searchCategoriesValidation = z.object({
  query: z.object({
    q: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const searchHistoryValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const deleteHistoryItemValidation = z.object({
  params: z.object({
    historyId: z.string().min(1, "History ID is required"),
  }),
});

export const recentlyViewedValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const suggestionsValidation = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
  }),
});
