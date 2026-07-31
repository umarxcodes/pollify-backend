import assert from "node:assert";
import { describe, it } from "node:test";
import { replyValidation } from "../src/modules/comment/comment.validation.js";
import { pollRepository } from "../src/modules/poll/poll.repository.js";
import { voteValidation } from "../src/modules/vote/vote.validation.js";

describe("production review regressions", () => {
  it("accepts a reply route that only contains a comment ID", () => {
    const result = replyValidation.safeParse({
      params: { commentId: "comment-id" },
      body: { content: "A valid reply" },
    });
    assert.strictEqual(result.success, true);
  });

  it("rejects duplicate option IDs in a vote", () => {
    const result = voteValidation.safeParse({
      params: { pollId: "poll-id" },
      body: { options: ["option-a", "option-a"] },
    });
    assert.strictEqual(result.success, false);
  });

  it("exposes the create operation required by PollService", () => {
    assert.strictEqual(typeof pollRepository.create, "function");
  });
});
