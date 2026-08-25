const test = require("node:test");
const assert = require("node:assert/strict");
const { actionEligibility, isExpired } = require("../src/services/publicQuoteService");

const OPEN_RFQ = { status: "QUOTED" };
const WON_RFQ = { status: "WON" };
const CANCELLED_RFQ = { status: "CANCELLED" };

function quote(overrides) {
  return { status: "SENT", validUntil: null, ...overrides };
}

test("isExpired: null validUntil never expires", () => {
  assert.equal(isExpired(quote({ validUntil: null })), false);
});

test("isExpired: a past validUntil is expired", () => {
  assert.equal(isExpired(quote({ validUntil: new Date(Date.now() - 86400000) })), true);
});

test("isExpired: a future validUntil is not expired", () => {
  assert.equal(isExpired(quote({ validUntil: new Date(Date.now() + 86400000) })), false);
});

test("actionEligibility: SENT/VIEWED with no expiry can be accepted, declined, revised", () => {
  for (const status of ["SENT", "VIEWED"]) {
    const e = actionEligibility(quote({ status }), OPEN_RFQ);
    assert.equal(e.canAccept, true, status);
    assert.equal(e.canDecline, true, status);
    assert.equal(e.canRequestRevision, true, status);
  }
});

test("actionEligibility: expired SENT quote cannot be accepted but can still be declined/revised", () => {
  const e = actionEligibility(quote({ status: "SENT", validUntil: new Date(Date.now() - 1000) }), OPEN_RFQ);
  assert.equal(e.canAccept, false);
  assert.equal(e.isExpired, true);
  assert.equal(e.canDecline, true);
  assert.equal(e.canRequestRevision, true);
});

test("actionEligibility: SUPERSEDED blocks every customer action", () => {
  const e = actionEligibility(quote({ status: "SUPERSEDED" }), OPEN_RFQ);
  assert.equal(e.canAccept, false);
  assert.equal(e.canDecline, false);
  assert.equal(e.canRequestRevision, false);
});

test("actionEligibility: ACCEPTED blocks accept/decline but revision-request stays possible", () => {
  const e = actionEligibility(quote({ status: "ACCEPTED" }), OPEN_RFQ);
  assert.equal(e.canAccept, false);
  assert.equal(e.canDecline, false);
});

test("actionEligibility: REJECTED blocks repeated decline but revision-request remains available", () => {
  const e = actionEligibility(quote({ status: "REJECTED" }), OPEN_RFQ);
  assert.equal(e.canDecline, false);
  assert.equal(e.canRequestRevision, true);
});

test("actionEligibility: revision-request is blocked once the RFQ is WON or CANCELLED", () => {
  assert.equal(actionEligibility(quote({ status: "REJECTED" }), WON_RFQ).canRequestRevision, false);
  assert.equal(actionEligibility(quote({ status: "REJECTED" }), CANCELLED_RFQ).canRequestRevision, false);
});
