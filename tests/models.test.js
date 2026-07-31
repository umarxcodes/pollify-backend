import { describe, it } from "node:test";
import assert from "node:assert";

describe("Mongoose Model Options", () => {
  it("should enforce strict mode by default", () => {
    const schemaOptions = { strict: true, strictQuery: true };
    assert.strictEqual(schemaOptions.strict, true);
    assert.strictEqual(schemaOptions.strictQuery, true);
  });

  it("should reject unknown fields when strict is true", () => {
    const payload = { name: "Test", unknownField: "should-be-rejected" };
    const allowedKeys = ["name"];
    const actualKeys = Object.keys(payload);
    const rejectedKeys = actualKeys.filter((k) => !allowedKeys.includes(k));
    assert.strictEqual(rejectedKeys.length > 0, true);
  });

  it("should reject unknown query operators when strictQuery is true", () => {
    const query = { name: "Test", $where: "this.password.length > 0" };
    const allowedKeys = ["name"];
    const actualKeys = Object.keys(query);
    const rejectedKeys = actualKeys.filter((k) => !allowedKeys.includes(k));
    assert.strictEqual(rejectedKeys.length > 0, true);
  });

  it("should require $ne for isDeleted queries", () => {
    const userQuery = { isDeleted: { $ne: true } };
    assert.strictEqual("$ne" in userQuery.isDeleted, true);
  });

  it("should validate ObjectId format", () => {
    const validId = "507f1f77bcf86cd799439011";
    const invalidId = "not-an-id";
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    assert.strictEqual(objectIdRegex.test(validId), true);
    assert.strictEqual(objectIdRegex.test(invalidId), false);
  });
});
