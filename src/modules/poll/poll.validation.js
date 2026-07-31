import { z } from "zod";

export const createPollValidation = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be at most 200 characters"),
    description: z
      .string()
      .max(1000, "Description must be at most 1000 characters")
      .optional(),
    options: z
      .array(
        z.object({
          text: z.string().min(1, "Option text is required"),
        })
      )
      .min(2, "At least two options are required"),
    type: z.enum(["single", "multiple", "anonymous"]).optional(),
    category: z.string().optional(),
    allowVoteChange: z.boolean().optional(),
    startsAt: z.string().optional(),
    expiresAt: z.string().min(1, "Expiration date is required"),
    tags: z.array(z.string()).optional(),
  }),
});

export const updatePollValidation = z.object({
  params: z.object({
    id: z.string().min(1, "Poll ID is required"),
  }),
  body: z
    .object({
      title: z.string().min(3).max(200).optional(),
      description: z.string().max(1000).optional(),
      options: z
        .array(
          z.object({
            text: z.string().min(1, "Option text is required"),
          })
        )
        .min(2)
        .optional(),
      status: z.enum(["draft", "active", "expired", "deleted"]).optional(),
      type: z.enum(["single", "multiple", "anonymous"]).optional(),
      category: z.string().optional(),
      allowVoteChange: z.boolean().optional(),
      startsAt: z.string().optional(),
      expiresAt: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Provide at least one field to update",
    }),
});

export const getPollValidation = z.object({
  params: z.object({
    id: z.string().min(1, "Poll ID is required"),
  }),
});

export const getPollsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    filter: z.enum(["latest", "trending", "popular", "ending-soon"]).optional(),
    sort: z.enum(["newest", "oldest", "popular", "ending-soon"]).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const getPollResultsValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});
