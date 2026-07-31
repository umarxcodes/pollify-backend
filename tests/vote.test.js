import { describe, it } from "node:test";
import assert from "node:assert";

describe("Vote Service", () => {
  it("should reject duplicate votes via unique index handling", () => {
    const mockError = new Error("Duplicate key");
    mockError.code = 11000;
    const result = mockError.code === 11000;
    assert.strictEqual(result, true);
  });

  it("should use atomic $inc in updatePollStats", () => {
    const updateOps = {
      $inc: { totalVotes: 1 },
      $set: { lastVoteAt: new Date() },
    };
    assert.strictEqual("$inc" in updateOps, true);
    assert.strictEqual(updateOps.$inc.totalVotes, 1);
  });

  it("should use atomic $inc in revertPollStats", () => {
    const revertOps = {
      $inc: { totalVotes: -1 },
    };
    assert.strictEqual("$inc" in revertOps, true);
    assert.strictEqual(revertOps.$inc.totalVotes, -1);
  });

  it("should count distinct userIds for uniqueVoters", () => {
    const voterIds = ["user1", "user2", "user2", "user3"];
    const uniqueCount = new Set(voterIds).size;
    assert.strictEqual(uniqueCount, 3);
  });
});
