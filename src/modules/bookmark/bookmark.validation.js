import { z } from "zod";

export const savePollValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const removeBookmarkValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const checkBookmarkValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const getBookmarksValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z
      .enum(["newest", "oldest", "recently_saved", "most_popular"])
      .optional(),
    search: z.string().optional(),
  }),
});

export const bookmarkStatsValidation = z.object({});
