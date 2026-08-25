const test = require("node:test");
const assert = require("node:assert/strict");
const { logSafeError, logSafeStartupError } = require("../src/utils/safeLog");

function captureConsoleError(fn) {
  const calls = [];
  const original = console.error;
  console.error = (...args) => calls.push(args);
  try {
    fn();
  } finally {
    console.error = original;
  }
  return calls;
}

test("logSafeError: in production, logs only name/code/method/path — never message/meta/stack", () => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    const err = new Error("failed for phone +919812345678");
    err.code = "P2002";
    err.meta = { target: ["phone"] };

    const calls = captureConsoleError(() =>
      logSafeError(err, { label: "db-unreachable", method: "POST", path: "/api/rfqs" }),
    );

    assert.equal(calls.length, 1);
    const logged = JSON.stringify(calls[0]);
    assert.equal(logged.includes("+919812345678"), false);
    assert.equal(logged.includes("failed for phone"), false);
    assert.equal(logged.includes("P2002"), true);
    assert.equal(logged.includes("db-unreachable"), true);
  } finally {
    process.env.NODE_ENV = previousEnv;
  }
});

test("logSafeError: outside production, logs the full error for local debugging", () => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  try {
    const err = new Error("boom");
    const calls = captureConsoleError(() => logSafeError(err, { label: "unhandled" }));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].includes(err), true);
  } finally {
    process.env.NODE_ENV = previousEnv;
  }
});

test("logSafeStartupError: never prints the stack in production, only name+message", () => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    const err = new Error("connect ECONNREFUSED 10.0.0.5:5432");
    const calls = captureConsoleError(() => logSafeStartupError("database", err));
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0].includes("connect ECONNREFUSED 10.0.0.5:5432"), true);
    assert.equal(calls[0][0].includes(err.stack.split("\n")[1] || "\0"), false);
  } finally {
    process.env.NODE_ENV = previousEnv;
  }
});
