import { z } from "zod";

// Zod schemas for validating request payloads in auth endpoints
const baseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, { message: "Name must be at least 3 characters" })
      .max(50, { message: "Name must be at most 50 characters" })
      .regex(/^[a-zA-Z\s]+$/, {
        message: "Name can only contain letters and spaces",
      }),

    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username must be at most 20 characters" })
      .regex(/^[a-zA-Z0-9_.]+$/, {
        message:
          "Username can only contain letters, numbers, underscore and dot",
      }),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Please provide a valid email" }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),

    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),

    terms: z.union([z.literal(true), z.literal("true")], {
      message: "You must accept the terms and conditions",
    }),
  })
  .strict();

// Ensure password and confirmPassword match
const registrationSchema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

// Validate uploaded file object shape ( Multer file )
const profileImageSchema = z
  .custom((file) => !file || (typeof file === "object" && file.buffer), {
    message: "Profile image is invalid",
  })
  .optional();

export const registerValidation = z.object({
  body: registrationSchema,
  file: profileImageSchema,
});

export const verifyEmailValidation = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email({ message: "Please provide a valid email" }),
      otp: z
        .string()
        .regex(/^\d{6}$/, { message: "OTP must be a 6-digit code" }),
    })
    .strict(),
});

export const resendVerificationValidation = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email({ message: "Please provide a valid email" }),
    })
    .strict(),
});

export const loginValidation = z.object({
  body: z
    .object({
      identifier: z
        .string()
        .trim()
        .min(1, { message: "Username or email is required" }),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
      rememberMe: z.union([z.literal(true), z.literal("true")]).optional(),
    })
    .strict(),
});

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const forgotPasswordValidation = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email"),
    })
    .strict(),
});
export const resetPasswordValidation = z.object({
  body: z
    .object({
      token: z.string().length(64, "Invalid reset token"),
      password: passwordSchema,
      confirmPassword: z.string(),
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }),
});
export const changePasswordValidation = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: passwordSchema,
      confirmPassword: z.string(),
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }),
});
export const updateProfileValidation = z
  .object({
    body: z
      .object({
        name: z
          .string()
          .trim()
          .min(3)
          .max(50)
          .regex(/^[a-zA-Z\s]+$/)
          .optional(),
        username: z
          .string()
          .trim()
          .toLowerCase()
          .min(3)
          .max(20)
          .regex(/^[a-zA-Z0-9_.]+$/)
          .optional(),
      })
      .strict(),
    file: profileImageSchema,
  })
  .refine((data) => data.body.name || data.body.username || data.file, {
    message: "Provide at least one profile field",
  });
