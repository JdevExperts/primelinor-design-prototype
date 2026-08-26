const test = require("node:test");
const assert = require("node:assert/strict");
const { requireRole } = require("../src/middleware/requireStaffAuth");

function callMiddleware(middleware, staffUser) {
  let error = null;
  const req = { staffUser };
  const next = (err) => {
    error = err;
  };
  middleware(req, {}, next);
  return error;
}

test("requireRole: SALES is denied on an ADMIN-only route (category image upload/delete)", () => {
  const error = callMiddleware(requireRole("ADMIN"), { role: "SALES" });
  assert.ok(error);
  assert.equal(error.statusCode, 403);
  assert.equal(error.message, "Not permitted.");
});

test("requireRole: ADMIN is allowed through", () => {
  const error = callMiddleware(requireRole("ADMIN"), { role: "ADMIN" });
  assert.equal(error, undefined);
});

test("requireRole: an unauthenticated request (no staffUser) is rejected as unauthenticated, not merely forbidden", () => {
  const error = callMiddleware(requireRole("ADMIN"), null);
  assert.ok(error);
  assert.equal(error.statusCode, 401);
});
