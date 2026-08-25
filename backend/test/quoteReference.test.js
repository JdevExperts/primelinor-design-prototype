const test = require("node:test");
const assert = require("node:assert/strict");
const { quotationReference } = require("../src/services/quoteReference");

test("quotationReference: appends the version to the RFQ reference", () => {
  const rfq = { reference: "PL-RQ-2026-000123" };
  assert.equal(quotationReference(rfq, { version: 1 }), "PL-RQ-2026-000123-V1");
  assert.equal(quotationReference(rfq, { version: 2 }), "PL-RQ-2026-000123-V2");
});
