const test = require("node:test");
const assert = require("node:assert/strict");
const noStore = require("../src/middleware/noStore");

test("noStore: sets Cache-Control: private, no-store and calls next()", () => {
  const headers = {};
  const res = { setHeader: (name, value) => { headers[name] = value; } };
  let nextCalled = false;

  noStore({}, res, () => { nextCalled = true; });

  assert.equal(headers["Cache-Control"], "private, no-store");
  assert.equal(nextCalled, true);
});
