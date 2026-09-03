const test = require("node:test");
const assert = require("node:assert/strict");

const { resolvePeriod, dayBuckets, periodRange } = require("../src/services/dashboardPeriods");
const {
  PREDICATES,
  backImageApplicable,
  hasBackImage,
} = require("../src/services/catalogHealthPredicates");
const { reviewProgress, SHARED_PREDICATE_BY_ISSUE } = require("../src/services/catalogueHealth");

const NOW = new Date("2026-09-03T12:00:00Z");

// ── §29 A/B/C/D. Trend day buckets + X-axis date data ────────────────
test("A/B/C. 7d / 30d / 90d windows produce the right number of day buckets", () => {
  const d7 = resolvePeriod("7d", NOW);
  const d30 = resolvePeriod("30d", NOW);
  const d90 = resolvePeriod("90d", NOW);
  assert.equal(dayBuckets(d7.from, d7.to).length, 8); // inclusive of both endpoints
  assert.equal(dayBuckets(d30.from, d30.to).length, 31);
  assert.equal(dayBuckets(d90.from, d90.to).length, 91);
});

test("D. day buckets are ISO YYYY-MM-DD, ascending, contiguous", () => {
  const b = dayBuckets(new Date("2026-08-30T10:00:00Z"), new Date("2026-09-02T02:00:00Z"));
  assert.deepEqual(b, ["2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02"]);
  assert.ok(b.every((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)));
});

// ── §29 H/I/J. RFQ / Lead / Quotation-thread period query ────────────
test("H/I/J. periodRange: trailing windows, today = local midnight, all/unknown = null", () => {
  assert.equal(periodRange("all", NOW), null);
  assert.equal(periodRange(undefined, NOW), null);
  assert.equal(periodRange("bogus", NOW), null);

  const today = periodRange("today", NOW);
  assert.equal(today.lt.getTime(), NOW.getTime());
  assert.equal(today.gte.getHours(), 0);
  assert.equal(today.gte.getMinutes(), 0);

  for (const [tok, days] of [
    ["7d", 7],
    ["30d", 30],
    ["90d", 90],
  ]) {
    const r = periodRange(tok, NOW);
    assert.equal(Math.round((r.lt - r.gte) / 864e5), days);
    assert.equal(r.lt.getTime(), NOW.getTime());
  }

  // 1y = same calendar date one year earlier (365 or 366 days).
  const y = periodRange("1y", NOW);
  assert.equal(y.lt.getTime(), NOW.getTime());
  assert.equal(y.gte.getUTCFullYear(), NOW.getUTCFullYear() - 1);
  assert.equal(y.gte.getUTCMonth(), NOW.getUTCMonth());
  assert.equal(y.gte.getUTCDate(), NOW.getUTCDate());
});

// ── §29 K. Studio-pending: dashboard count + Admin filter share ONE predicate ──
test("K. studioPending: the health issue maps to PREDICATES.studioPending (one source)", () => {
  assert.equal(SHARED_PREDICATE_BY_ISSUE.customizableNotStudioReady, PREDICATES.studioPending);
  // where fragment is well-formed and only ever narrows to customizable + missing setup
  const w = PREDICATES.studioPending.where;
  assert.equal(w.customizable, true);
  assert.equal(w.OR.length, 2);
});

test("K. studioPending.test mirrors isStudioReady (customizable AND front asset AND front zone)", () => {
  const ready = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_FRONT" }],
    placementZones: [{ view: "FRONT" }],
  };
  assert.equal(PREDICATES.studioPending.test(ready), false);
  assert.equal(PREDICATES.studioPending.test({ ...ready, placementZones: [] }), true); // no front zone
  assert.equal(PREDICATES.studioPending.test({ ...ready, assets: [] }), true); // no front asset
  assert.equal(PREDICATES.studioPending.test({ ...ready, customizable: false }), false); // not customizable → n/a
});

// ── §29 L/M. Missing Back Image applicability ────────────────────────
test("L. backImageApplicable: true for apparel-tops (size-typed / category / decorated)", () => {
  assert.equal(backImageApplicable({ variantType: "size" }), true);
  assert.equal(backImageApplicable({ primaryCategory: { slug: "hoodies" } }), true);
  assert.equal(backImageApplicable({ primaryCategory: { slug: "uniforms" } }), true);
  assert.equal(backImageApplicable({ assets: [{ type: "CUSTOMIZATION_FRONT" }] }), true);
  assert.equal(backImageApplicable({ placementZones: [{ view: "FRONT" }] }), true);
});

test("M. backImageApplicable: false for non-apparel (pen, bottle, mug, notebook, calendar, gift box)", () => {
  for (const slug of ["pens", "bottles", "mugs", "notebooks", "calendars", "kits", "visiting-cards"]) {
    assert.equal(
      backImageApplicable({ primaryCategory: { slug }, variantType: null, assets: [{ type: "CATALOG" }], placementZones: [] }),
      false,
      slug,
    );
  }
});

test("N. hasBackImage / missingBackImage.test: only a canonical BACK asset counts", () => {
  const tee = { variantType: "size", assets: [{ type: "CATALOG" }, { type: "GALLERY_FRONT" }] };
  assert.equal(hasBackImage(tee), false);
  assert.equal(PREDICATES.missingBackImage.test(tee), true);
  // a second CATALOG photo does NOT satisfy "has back image" (§16)
  assert.equal(hasBackImage({ ...tee, assets: [...tee.assets, { type: "CATALOG" }] }), false);
  // an actual GALLERY_BACK / CUSTOMIZATION_BACK does
  assert.equal(hasBackImage({ ...tee, assets: [...tee.assets, { type: "GALLERY_BACK" }] }), true);
  assert.equal(PREDICATES.missingBackImage.test({ ...tee, assets: [...tee.assets, { type: "CUSTOMIZATION_BACK" }] }), false);
  // non-apparel with no back asset is NOT flagged
  assert.equal(PREDICATES.missingBackImage.test({ primaryCategory: { slug: "pens" }, assets: [{ type: "CATALOG" }] }), false);
});

// ── §29 O/P/Q. Review counts + progress ─────────────────────────────
test("O/P/Q. reviewProgress: reviewed = total - pending; integer percent; clamps", () => {
  assert.deepEqual(reviewProgress(46, 46), { totalProducts: 46, pendingReview: 46, reviewed: 0, progressPct: 0 });
  assert.deepEqual(reviewProgress(46, 34), { totalProducts: 46, pendingReview: 34, reviewed: 12, progressPct: 26 });
  assert.deepEqual(reviewProgress(46, 0), { totalProducts: 46, pendingReview: 0, reviewed: 46, progressPct: 100 });
  assert.deepEqual(reviewProgress(0, 0), { totalProducts: 0, pendingReview: 0, reviewed: 0, progressPct: 0 });
  // pending can't exceed total
  assert.equal(reviewProgress(10, 99).pendingReview, 10);
});
