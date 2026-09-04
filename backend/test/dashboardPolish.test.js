const test = require("node:test");
const assert = require("node:assert/strict");

const { namedDateRange, queryString } = require("../src/services/dashboardPeriods");
const {
  evaluateProductHealth,
  manualQuoteRequiredCount,
  ISSUE_DEFS,
} = require("../src/services/catalogueHealth");
const { summariseThreads } = require("../src/services/quotationThreadMetrics");

// ── §2/§4 RFQ & Lead date-filter parsing (named range → dateFrom/dateTo) ──
test("namedDateRange: today / this-week / this-month resolve to a [from,to] window", () => {
  const now = new Date("2026-09-03T12:00:00Z");
  const today = namedDateRange("today", now);
  assert.equal(new Date(today.dateTo).getTime(), now.getTime());
  assert.equal(new Date(today.dateFrom).getHours(), 0); // local midnight

  const week = namedDateRange("this-week", now);
  assert.equal((new Date(week.dateTo) - new Date(week.dateFrom)) / 864e5, 7);

  const month = namedDateRange("this-month", now);
  assert.equal((new Date(month.dateTo) - new Date(month.dateFrom)) / 864e5, 30);

  assert.equal(namedDateRange("all-time", now), null);
  assert.equal(namedDateRange(undefined, now), null);
});

test("queryString: builds a query and skips empty values", () => {
  assert.equal(queryString({ status: "NEW" }), "?status=NEW");
  assert.equal(queryString({ status: "NEW", source: "", assignedTo: null, page: undefined }), "?status=NEW");
  assert.equal(queryString({}), "");
  assert.equal(
    queryString({ dateFrom: "2026-09-01T00:00:00.000Z" }),
    "?dateFrom=2026-09-01T00%3A00%3A00.000Z",
  );
});

// ── §10 QUOTE_ONLY is a valid pricing configuration, NOT "missingPricing" ──
test("evaluateProductHealth: a QUOTE_ONLY product with no fixed price / tiers is NOT missingPricing", () => {
  const base = {
    productCode: "PL-QO-001",
    moq: 25,
    longSpec: "Details",
    material: "Steel",
    primaryCategoryId: "c1",
    assets: [{ type: "CATALOG", active: true }],
    priceTiers: [],
    specifications: [{ id: "s1" }],
    variants: [],
    colors: [{ id: "col1" }],
    categories: [{ categoryId: "c1" }],
    relatedFrom: [{ id: "r1" }, { id: "r2" }],
    placementZones: [],
    customizable: false,
    variantType: null,
  };
  assert.equal(evaluateProductHealth({ ...base, priceMode: "QUOTE_ONLY", fixedPrice: null }).includes("missingPricing"), false);
  // …but a FIXED product with no price IS flagged, and a TIERED product with no tiers IS flagged.
  assert.equal(evaluateProductHealth({ ...base, priceMode: "FIXED", fixedPrice: null }).includes("missingPricing"), true);
  assert.equal(evaluateProductHealth({ ...base, priceMode: "TIERED", fixedPrice: null }).includes("missingPricing"), true);
});

test("missingPricing is an ERROR severity; every issue def carries a severity", () => {
  assert.equal(ISSUE_DEFS.missingPricing.severity, "error");
  for (const [key, def] of Object.entries(ISSUE_DEFS)) {
    assert.ok(["error", "attention", "info"].includes(def.severity), `${key} needs a severity`);
    assert.ok(def.definition.length > 10);
  }
});

// ── §11 QUOTE_ONLY appears in the manual-quote-required (info) count ──
test("manualQuoteRequiredCount: counts only active QUOTE_ONLY products, never FIXED/TIERED", () => {
  const products = [
    { priceMode: "QUOTE_ONLY" },
    { priceMode: "QUOTE_ONLY" },
    { priceMode: "FIXED" },
    { priceMode: "TIERED" },
  ];
  assert.equal(manualQuoteRequiredCount(products), 2);
  assert.equal(manualQuoteRequiredCount([]), 0);
});

// ── §5 quotation "active thread" semantics: thread-based, expiry excluded ──
test("active-thread semantics: latest DRAFT/SENT/VIEWED counts, an expired latest does not", () => {
  const now = new Date("2026-09-03T12:00:00Z");
  const s = summariseThreads(
    [
      // g1: latest V2 SENT, still valid → active
      { quotationGroupId: "g1", version: 1, status: "SUPERSEDED", grandTotal: 100 },
      { quotationGroupId: "g1", version: 2, status: "SENT", grandTotal: 120, validUntil: new Date("2026-10-01") },
      // g2: latest SENT but past validUntil → expired, NOT active
      { quotationGroupId: "g2", version: 1, status: "SENT", grandTotal: 90, validUntil: new Date("2026-08-01") },
      // g3: latest ACCEPTED → not active
      { quotationGroupId: "g3", version: 1, status: "ACCEPTED", grandTotal: 200 },
    ],
    now,
  );
  assert.equal(s.active, 1); // only g1
  assert.equal(s.expired, 1); // g2
});
