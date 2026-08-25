process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-production";

const test = require("node:test");
const assert = require("node:assert/strict");
const { hashPassword, verifyPassword, signStaffToken, verifyStaffToken } = require("../src/services/auth");

test("hashPassword/verifyPassword: round-trips correctly", async () => {
  const hash = await hashPassword("correct-horse-battery-staple");
  assert.equal(await verifyPassword("correct-horse-battery-staple", hash), true);
});

test("verifyPassword: rejects a wrong password", async () => {
  const hash = await hashPassword("correct-horse-battery-staple");
  assert.equal(await verifyPassword("wrong-password", hash), false);
});

test("hashPassword: two hashes of the same password differ (salted)", async () => {
  const a = await hashPassword("same-password");
  const b = await hashPassword("same-password");
  assert.notEqual(a, b);
});

test("signStaffToken/verifyStaffToken: round-trips the staff id and role", () => {
  const token = signStaffToken({ id: "staff-1", role: "ADMIN" });
  const payload = verifyStaffToken(token);
  assert.equal(payload.sub, "staff-1");
  assert.equal(payload.role, "ADMIN");
});

test("verifyStaffToken: rejects a garbage token", () => {
  assert.equal(verifyStaffToken("not-a-real-token"), null);
});

test("verifyStaffToken: rejects a token signed with a different secret", () => {
  const jwt = require("jsonwebtoken");
  const forged = jwt.sign({ sub: "staff-1", role: "ADMIN" }, "a-different-secret");
  assert.equal(verifyStaffToken(forged), null);
});
