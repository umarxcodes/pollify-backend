import { z } from "zod";

export const pollAnalyticsValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const chartDataValidation = z.object({
  params: z.object({
    pollId: z.string().min(1, "Poll ID is required"),
  }),
});

export const dashboardValidation = z.object({});

export const trendingValidation = z.object({});
