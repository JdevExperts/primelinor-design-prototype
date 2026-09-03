const test = require("node:test");
const assert = require("node:assert/strict");

const { resolvePeriod, pctChange, dayBuckets } = require("../src/services/dashboardPeriods");
const { summariseThreads } = require("../src/services/quotationThreadMetrics");
const { foldProductQuotationLines } = require("../src/services/productPerformance");
const { evaluateProductHealth } = require("../src/services/catalogueHealth");

// ── §35 period windows + comparison ─────────────────────────────────
test("resolvePeriod: 7d yields a 7-day window and an equal preceding window", () => {
  const now = new Date("2026-09-03T12:00:00Z");
  const p = resolvePeriod("7d", now);
  assert.equal(p.token, "7d");
  assert.equal(p.to.getTime(), now.getTime());
  assert.equal((p.to - p.from) / 864e5, 7);
  assert.equal((p.from - p.prevFrom) / 864e5, 7);
  assert.equal(p.prevTo.getTime(), p.from.getTime());
});

test("resolvePeriod: today starts at local midnight; unknown token falls back to 7d", () => {
  const now = new Date("2026-09-03T12:00:00Z");
  const t = resolvePeriod("today", now);
  assert.equal(t.from.getHours(), 0);
  assert.equal(resolvePeriod("bogus", now).token, "7d");
});

test("pctChange: no baseline -> null (not Infinity); 0 vs 0 -> 0", () => {
  assert.equal(pctChange(10, 0), null);
  assert.equal(pctChange(0, 0), 0);
  assert.equal(pctChange(28, 23), 22);
  assert.equal(pctChange(5, 10), -50);
});

test("dayBuckets: inclusive UTC day list across the span", () => {
  const b = dayBuckets(new Date("2026-09-01T05:00:00Z"), new Date("2026-09-03T22:00:00Z"));
  assert.deepEqual(b, ["2026-09-01", "2026-09-02", "2026-09-03"]);
});

// ── §24/§25 quotation THREAD counting ──────────────────────────────
test("summariseThreads: three versions of one thread count as ONE thread", () => {
  const now = new Date("2026-09-03T12:00:00Z");
  const rows = [
    { quotationGroupId: "g1", version: 1, status: "SUPERSEDED", grandTotal: 7975 },
    { quotationGroupId: "g1", version: 2, status: "SUPERSEDED", grandTotal: 15375 },
    { quotationGroupId: "g1", version: 3, status: "SENT", grandTotal: 14875, validUntil: new Date("2026-09-20") },
  ];
  const s = summariseThreads(rows, now);
  assert.equal(s.totalThreads, 1);
  assert.equal(s.byStatus.SENT, 1);
  assert.equal(s.byStatus.SUPERSEDED, undefined); // superseded isn't a thread bucket
  assert.equal(s.active, 1);
  assert.equal(s.quotedValue, 14875); // most recent sent-or-later version
});

test("summariseThreads: a thread with ANY accepted version is ACCEPTED and feeds Accepted Value", () => {
  const now = new Date("2026-09-03T12:00:00Z");
  const s = summariseThreads(
    [
      { quotationGroupId: "g2", version: 1, status: "SUPERSEDED", grandTotal: 100 },
      { quotationGroupId: "g2", version: 2, status: "ACCEPTED", grandTotal: 250 },
      { quotationGroupId: "g3", version: 1, status: "REJECTED", grandTotal: 90 },
      { quotationGroupId: "g4", version: 1, status: "DRAFT", grandTotal: 0 },
    ],
    now,
  );
  assert.equal(s.byStatus.ACCEPTED, 1);
  assert.equal(s.byStatus.REJECTED, 1);
  assert.equal(s.byStatus.DRAFT, 1);
  assert.equal(s.acceptedValue, 250);
  assert.equal(s.reachedCustomer, 2); // g2 (accepted) + g3 (rejected)
  assert.equal(s.acceptanceRate, 50); // 1 accepted / 2 reached
});

test("summariseThreads: expired = latest SENT/VIEWED past validUntil, computed not stored", () => {
  const now = new Date("2026-09-03T12:00:00Z");
  const s = summariseThreads(
    [{ quotationGroupId: "g5", version: 1, status: "SENT", grandTotal: 500, validUntil: new Date("2026-08-01") }],
    now,
  );
  assert.equal(s.expired, 1);
  assert.equal(s.active, 0);
});

test("summariseThreads: latest version carries the pending-revision flag", () => {
  const now = new Date("2026-09-03T12:00:00Z");
  const s = summariseThreads(
    [
      { quotationGroupId: "g6", version: 1, status: "SUPERSEDED", grandTotal: 100, pendingRevision: false },
      { quotationGroupId: "g6", version: 2, status: "VIEWED", grandTotal: 120, pendingRevision: true, validUntil: new Date("2026-10-01") },
    ],
    now,
  );
  assert.equal(s.pendingRevision, 1);
});

// ── §32 product value attribution ─────────────────────────────────
test("foldProductQuotationLines: attributes per-product line amounts, not grand totals", () => {
  const lines = [
    // thread A: V1 sent (product p1 @ 1000, p2 @ 500), V2 accepted (p1 @ 900, p2 @ 450)
    { productId: "p1", quotationGroupId: "A", version: 1, status: "SUPERSEDED", lineTotal: 1000 },
    { productId: "p2", quotationGroupId: "A", version: 1, status: "SUPERSEDED", lineTotal: 500 },
    { productId: "p1", quotationGroupId: "A", version: 2, status: "ACCEPTED", lineTotal: 900 },
    { productId: "p2", quotationGroupId: "A", version: 2, status: "ACCEPTED", lineTotal: 450 },
    // thread B: only sent, product p1 @ 700
    { productId: "p1", quotationGroupId: "B", version: 1, status: "SENT", lineTotal: 700 },
  ];
  const m = foldProductQuotationLines(lines);
  assert.equal(m.get("p1").quotationThreads, 2);
  assert.equal(m.get("p1").acceptedThreads, 1);
  assert.equal(m.get("p1").acceptedValue, 900); // accepted version's p1 line only
  assert.equal(m.get("p1").quotedValue, 1600); // A's latest sent-or-later (V2, 900) + B (700)
  assert.equal(m.get("p2").acceptedValue, 450);
  assert.equal(m.get("p2").quotationThreads, 1);
});

// ── §28 catalogue health rules ───────────────────────────────────
test("evaluateProductHealth: a fully-configured product has no issues", () => {
  const good = {
    productCode: "PL-TS-001",
    moq: 50,
    priceMode: "FIXED",
    fixedPrice: 199,
    longSpec: "220 GSM biowash cotton",
    material: "Cotton",
    variantType: "size",
    customizable: true,
    primaryCategoryId: "cat1",
    assets: [{ type: "CATALOG", active: true }, { type: "CUSTOMIZATION_FRONT", active: true }],
    priceTiers: [],
    specifications: [{ id: "s1" }],
    variants: [{ id: "v1" }],
    colors: [{ id: "c1" }],
    categories: [{ categoryId: "cat1" }],
    relatedFrom: [{ id: "r1" }, { id: "r2" }],
    placementZones: [{ view: "FRONT" }],
  };
  assert.deepEqual(evaluateProductHealth(good), []);
});

test("evaluateProductHealth: flags each real gap", () => {
  const bad = {
    productCode: "not-a-code",
    moq: 0,
    priceMode: "TIERED",
    fixedPrice: null,
    longSpec: "",
    material: "",
    variantType: "size",
    customizable: true,
    primaryCategoryId: "cat1",
    assets: [],
    priceTiers: [],
    specifications: [],
    variants: [],
    colors: [],
    categories: [{ categoryId: "other" }],
    relatedFrom: [],
    placementZones: [],
  };
  const issues = evaluateProductHealth(bad);
  for (const key of [
    "missingPrimaryImage",
    "invalidProductCode",
    "missingMoq",
    "missingPricing",
    "missingSpecs",
    "declaresVariantsButNoneDefined",
    "noColours",
    "categoryMismatch",
    "weakRelatedProducts",
    "customizableNotStudioReady",
  ]) {
    assert.ok(issues.includes(key), `expected issue: ${key}`);
  }
});
