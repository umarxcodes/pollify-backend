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
