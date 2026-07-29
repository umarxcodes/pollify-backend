import assert from "node:assert/strict";
import test from "node:test";
import app from "../src/app.js";

test("application exposes health and CSRF routes", () => {
  assert.equal(typeof app, "function");
  const routes = app.router.stack
    .filter((layer) => layer.route)
    .map((layer) => layer.route.path);
  assert.ok(routes.includes("/health"));
  assert.ok(routes.includes("/api/v1/csrf-token"));
});
