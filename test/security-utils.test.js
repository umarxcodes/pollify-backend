import assert from "node:assert/strict";
import test from "node:test";
import { generateOTP } from "../src/utils/generateOTP.js";
import { hashOTP, verifyOTP } from "../src/utils/otp.util.js";
import { generateSecureToken, hashToken } from "../src/utils/token.util.js";

test("OTP is six numeric digits and is verified only by its hash", async () => {
  const otp = generateOTP();
  assert.match(otp, /^\d{6}$/);
  const hash = await hashOTP(otp);
  assert.equal(await verifyOTP(otp, hash), true);
  assert.equal(await verifyOTP("000000", hash), false);
});

test("secure tokens are high-entropy and deterministic only after hashing", () => {
  const token = generateSecureToken();
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(hashToken(token), hashToken(token));
  assert.notEqual(hashToken(token), hashToken(generateSecureToken()));
});
