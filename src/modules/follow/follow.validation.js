import { z } from "zod";

export const followValidation = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
});

export const getUserValidation = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
});
