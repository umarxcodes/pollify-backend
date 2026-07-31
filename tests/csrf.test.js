import { describe, it } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

function verifyCsrfToken(req) {
  const method = req.method.toLowerCase();
  if (["get", "head", "options"].includes(method)) {
    return { valid: true, bypassed: true };
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (
    !cookieToken ||
    !headerToken ||
    typeof headerToken !== "string" ||
    cookieToken.length !== headerToken.length ||
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    return { valid: false, bypassed: false };
  }

  return { valid: true, bypassed: false };
}

describe("CSRF Middleware", () => {
  it("should bypass CSRF for GET requests", () => {
    const req = { method: "GET", cookies: {}, headers: {} };
    const result = verifyCsrfToken(req);
    assert.strictEqual(result.bypassed, true);
    assert.strictEqual(result.valid, true);
  });

  it("should bypass CSRF for HEAD requests", () => {
    const req = { method: "HEAD", cookies: {}, headers: {} };
    const result = verifyCsrfToken(req);
    assert.strictEqual(result.bypassed, true);
  });

  it("should bypass CSRF for OPTIONS requests", () => {
    const req = { method: "OPTIONS", cookies: {}, headers: {} };
    const result = verifyCsrfToken(req);
    assert.strictEqual(result.bypassed, true);
  });

  it("should reject POST requests without token", () => {
    const req = { method: "POST", cookies: {}, headers: {} };
    const result = verifyCsrfToken(req);
    assert.strictEqual(result.valid, false);
  });

  it("should reject POST requests with invalid token", () => {
    const req = {
      method: "POST",
      cookies: { [CSRF_COOKIE_NAME]: "abc" },
      headers: { [CSRF_HEADER_NAME]: "xyz" },
    };
    const result = verifyCsrfToken(req);
    assert.strictEqual(result.valid, false);
  });

  it("should accept POST requests with valid matching tokens", () => {
    const token = generateCsrfToken();
    const req = {
      method: "POST",
      cookies: { [CSRF_COOKIE_NAME]: token },
      headers: { [CSRF_HEADER_NAME]: token },
    };
    const result = verifyCsrfToken(req);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.bypassed, false);
  });
});
