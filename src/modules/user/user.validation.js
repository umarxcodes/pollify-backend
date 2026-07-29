import { z } from "zod";

export const getProfileValidation = z.object({
  params: z.object({
    username: z.string().optional(),
  }),
});

export const updateProfileValidation = z.object({
  body: z
    .object({
      fullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters")
        .max(50, "Full name must be at most 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
        .optional(),
      username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(
          /^[a-zA-Z0-9_.]+$/,
          "Username can only contain letters, numbers, underscore and dot"
        )
        .optional(),
      bio: z
        .string()
        .trim()
        .max(300, "Bio must be at most 300 characters")
        .optional(),
      website: z
        .string()
        .trim()
        .url("Website must be a valid URL")
        .optional()
        .or(z.literal("")),
      github: z
        .string()
        .trim()
        .url("GitHub must be a valid URL")
        .optional()
        .or(z.literal("")),
      linkedin: z
        .string()
        .trim()
        .url("LinkedIn must be a valid URL")
        .optional()
        .or(z.literal("")),
      twitter: z
        .string()
        .trim()
        .url("Twitter must be a valid URL")
        .optional()
        .or(z.literal("")),
      location: z
        .string()
        .trim()
        .max(100, "Location must be at most 100 characters")
        .optional()
        .or(z.literal("")),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Provide at least one field to update",
    }),
});

export const uploadProfileImageValidation = z.object({
  file: z
    .custom(
      (file) =>
        !file || (typeof file === "object" && file.buffer && file.mimetype),
      "Profile image is invalid"
    )
    .optional(),
});

export const deleteAccountValidation = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required to delete account"),
  }),
});
