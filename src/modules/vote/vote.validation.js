import { z } from "zod";

export const voteValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
  body: z.object({
    options: z
      .array(z.string().min(1, "Option ID is required"))
      .min(1, "At least one option is required")
      .refine((options) => new Set(options).size === options.length, {
        message: "Each option may only be selected once",
      }),
    isAnonymous: z.boolean().optional(),
  }),
});

export const removeVoteValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const getPollVotersValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getResultsValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const getPollStatsValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const getUserVoteHistoryValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
