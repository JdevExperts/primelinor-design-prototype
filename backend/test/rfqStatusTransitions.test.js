const test = require("node:test");
const assert = require("node:assert/strict");
const { isTransitionAllowed, OPEN_STATES } = require("../src/services/rfqStatusTransitions");

test("isTransitionAllowed: NEW -> IN_PROGRESS is allowed", () => {
  assert.equal(isTransitionAllowed("NEW", "IN_PROGRESS"), true);
});

test("isTransitionAllowed: IN_PROGRESS -> WON is NOT allowed without override", () => {
  assert.equal(isTransitionAllowed("IN_PROGRESS", "WON"), false);
});

test("isTransitionAllowed: QUOTED <-> NEGOTIATING both directions allowed", () => {
  assert.equal(isTransitionAllowed("QUOTED", "NEGOTIATING"), true);
  assert.equal(isTransitionAllowed("NEGOTIATING", "QUOTED"), true);
});

test("isTransitionAllowed: every open state can move to LOST and CANCELLED", () => {
  for (const state of OPEN_STATES) {
    assert.equal(isTransitionAllowed(state, "LOST"), true, `${state} -> LOST`);
    assert.equal(isTransitionAllowed(state, "CANCELLED"), true, `${state} -> CANCELLED`);
  }
});

test("isTransitionAllowed: terminal states have no forward transitions", () => {
  assert.equal(isTransitionAllowed("WON", "IN_PROGRESS"), false);
  assert.equal(isTransitionAllowed("LOST", "NEW"), false);
  assert.equal(isTransitionAllowed("CANCELLED", "NEW"), false);
});

test("isTransitionAllowed: same-state no-op is always allowed", () => {
  assert.equal(isTransitionAllowed("QUOTED", "QUOTED"), true);
});

test("isTransitionAllowed: override bypasses the table entirely (ADMIN)", () => {
  assert.equal(isTransitionAllowed("WON", "NEW", { override: true }), true);
  assert.equal(isTransitionAllowed("CANCELLED", "QUOTED", { override: true }), true);
});
