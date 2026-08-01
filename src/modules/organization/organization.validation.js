import { z } from "zod";

export const createOrganizationValidation = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be at most 100 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").max(50, "Slug must be at most 50 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    description: z.string().max(500, "Description must be at most 500 characters").optional(),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    allowPublicPolls: z.boolean().optional(),
    requireApproval: z.boolean().optional(),
    maxMembers: z.number().int().min(1).max(1000).optional(),
  }),
});

export const updateOrganizationValidation = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().max(500).optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    logo: z.string().optional().or(z.literal("")),
    allowPublicPolls: z.boolean().optional(),
    requireApproval: z.boolean().optional(),
    maxMembers: z.number().int().min(1).max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getOrganizationValidation = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
});

export const listOrganizationsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const inviteMemberValidation = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
  body: z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "member"]).optional(),
  }),
});

export const removeMemberValidation = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
    userId: z.string().min(1, "User ID is required"),
  }),
});

export const updateMemberRoleValidation = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
    userId: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    role: z.enum(["owner", "admin", "member"]),
  }),
});
