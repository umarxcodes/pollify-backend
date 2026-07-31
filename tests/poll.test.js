import { describe, it } from "node:test";
import assert from "node:assert";
import { z } from "zod";

const createPollSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  options: z.array(z.object({ text: z.string().min(1) })).min(2),
  category: z.string().optional(),
  type: z.enum(["single", "multiple", "anonymous"]).optional(),
  allowVoteChange: z.boolean().optional(),
  expiresAt: z.coerce.date(),
  tags: z.array(z.string()).optional(),
});

const updatePollSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  options: z
    .array(z.object({ text: z.string().min(1) }))
    .min(2)
    .optional(),
  category: z.string().optional(),
  type: z.enum(["single", "multiple", "anonymous"]).optional(),
  allowVoteChange: z.boolean().optional(),
  expiresAt: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "active", "expired", "deleted"]).optional(),
});

describe("Poll Validation Schemas", () => {
  it("should accept valid create poll payload", () => {
    const futureDate = new Date(Date.now() + 86400000);
    const result = createPollSchema.safeParse({
      title: "Best Framework?",
      description: "Vote for your favorite",
      options: [{ text: "React" }, { text: "Vue" }],
      category: "Tech",
      type: "single",
      allowVoteChange: true,
      expiresAt: futureDate.toISOString(),
      tags: ["javascript", "frontend"],
    });
    assert.strictEqual(result.success, true);
  });

  it("should reject poll with less than 2 options", () => {
    const futureDate = new Date(Date.now() + 86400000);
    const result = createPollSchema.safeParse({
      title: "Best Framework?",
      options: [{ text: "React" }],
      expiresAt: futureDate.toISOString(),
    });
    assert.strictEqual(result.success, false);
  });

  it("should require expiresAt to be a non-empty string", () => {
    const futureDate = new Date(Date.now() + 86400000);
    const result = createPollSchema.safeParse({
      title: "Best Framework?",
      options: [{ text: "React" }, { text: "Vue" }],
      expiresAt: futureDate.toISOString(),
    });
    assert.strictEqual(result.success, true);
  });

  it("should reject missing expiresAt", () => {
    const result = createPollSchema.safeParse({
      title: "Best Framework?",
      options: [{ text: "React" }, { text: "Vue" }],
    });
    assert.strictEqual(result.success, false);
  });

  it("should accept valid update poll payload", () => {
    const futureDate = new Date(Date.now() + 86400000);
    const result = updatePollSchema.safeParse({
      title: "Updated Title",
      description: "Updated description",
      options: [{ text: "React" }, { text: "Vue" }, { text: "Angular" }],
      category: "Tech",
      expiresAt: futureDate.toISOString(),
      status: "active",
    });
    assert.strictEqual(result.success, true);
  });
});
