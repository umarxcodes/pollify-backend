import { describe, it } from "node:test";
import assert from "node:assert";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3).max(50),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_.]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

describe("Auth Validation Schemas", () => {
  it("should accept valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "securepass123",
    });
    assert.strictEqual(result.success, true);
  });

  it("should reject invalid email formats", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      username: "johndoe",
      email: "invalid-email",
      password: "securepass123",
    });
    assert.strictEqual(result.success, false);
  });

  it("should reject weak passwords", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "short",
    });
    assert.strictEqual(result.success, false);
  });

  it("should reject missing required fields", () => {
    const result = registerSchema.safeParse({
      name: "John",
    });
    assert.strictEqual(result.success, false);
  });

  it("should accept valid login payload", () => {
    const result = loginSchema.safeParse({
      identifier: "john@example.com",
      password: "password123",
    });
    assert.strictEqual(result.success, true);
  });

  it("should accept valid forgot-password payload", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "john@example.com",
    });
    assert.strictEqual(result.success, true);
  });

  it("should accept valid reset-password payload", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "newsecurepass123",
    });
    assert.strictEqual(result.success, true);
  });
});
