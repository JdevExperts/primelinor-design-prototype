const test = require("node:test");
const assert = require("node:assert/strict");

const { bareGroupReference, latestPerGroup, versionCountByGroup } = require("../src/services/quotationThread");
const { serializeQuotationVersionRow } = require("../src/services/serializeAdmin");

// ── §19 E. Old exact reference search still finds the thread ──────────

test("E. bareGroupReference strips a trailing -V<n> so an old reference matches the group", () => {
  assert.equal(bareGroupReference("PL-QT-2026-000011-V1"), "PL-QT-2026-000011");
  assert.equal(bareGroupReference("PL-QT-2026-000011-V12"), "PL-QT-2026-000011");
  assert.equal(bareGroupReference("PL-RQ-2026-000030-V2 "), "PL-RQ-2026-000030");
  // no suffix → unchanged
  assert.equal(bareGroupReference("PL-QT-2026-000011"), "PL-QT-2026-000011");
  assert.equal(bareGroupReference("CMA CGM"), "CMA CGM");
  assert.equal(bareGroupReference(""), "");
});

// ── §19 A/B/C. Group with V1/V2/V3 collapses to one latest row ────────

const threadRows = [
  { id: "a", quotationGroupId: "g1", version: 1, status: "SUPERSEDED" },
  { id: "b", quotationGroupId: "g1", version: 2, status: "SUPERSEDED" },
  { id: "c", quotationGroupId: "g1", version: 3, status: "SENT" },
  { id: "d", quotationGroupId: "g2", version: 1, status: "DRAFT" },
];

test("A. latestPerGroup returns one row per quotationGroupId", () => {
  const rows = latestPerGroup(threadRows);
  assert.equal(rows.length, 2);
  assert.deepEqual(
    rows.map((r) => r.quotationGroupId).sort(),
    ["g1", "g2"],
  );
});

test("B. latest row for a thread is the highest version number, not updatedAt order", () => {
  // deliberately shuffled input order
  const shuffled = [threadRows[2], threadRows[0], threadRows[1]];
  const [latest] = latestPerGroup(shuffled);
  assert.equal(latest.id, "c");
  assert.equal(latest.version, 3);
  assert.equal(latest.status, "SENT");
});

test("C. versionCountByGroup counts every version in the thread", () => {
  const counts = versionCountByGroup(threadRows);
  assert.equal(counts.get("g1"), 3);
  assert.equal(counts.get("g2"), 1);
});

// ── §19 D. Filter uses the latest version's status ───────────────────

test("D. a thread whose old versions are SUPERSEDED still reads as its latest status", () => {
  const [latest] = latestPerGroup(threadRows.filter((r) => r.quotationGroupId === "g1"));
  // The list groups on this row, so a SUPERSEDED status filter would not
  // match it and a SENT filter would — old SUPERSEDED rows never leak in.
  assert.equal(latest.status, "SENT");
});

// ── §19 F/G. Version History row shape (newest→oldest handled by caller) ──

test("F/G. serializeQuotationVersionRow carries id, reference, status, total, createdBy for a clickable exact-version row", () => {
  const row = serializeQuotationVersionRow(
    {
      id: "v2-id",
      version: 2,
      status: "SUPERSEDED",
      grandTotal: "15375",
      validUntil: new Date("2026-09-10T00:00:00Z"),
      createdAt: new Date("2026-09-03T10:41:00Z"),
      updatedAt: new Date("2026-09-03T10:41:00Z"),
      createdBy: { id: "u1", name: "PrimeLinor Admin", email: "a@b.com" },
      lines: [],
    },
    { reference: null }, // MANUAL: no RFQ
  );
  assert.equal(row.id, "v2-id");
  assert.equal(row.version, 2);
  assert.equal(row.status, "SUPERSEDED");
  assert.equal(row.grandTotal, 15375);
  assert.equal(row.createdBy.name, "PrimeLinor Admin");
});

test("F/G. RFQ-origin version row reference resolves from the parent RFQ", () => {
  const row = serializeQuotationVersionRow(
    { id: "x", version: 3, status: "SENT", grandTotal: "100", lines: [], createdBy: null },
    { reference: "PL-RQ-2026-000030" },
  );
  assert.equal(row.reference, "PL-RQ-2026-000030-V3");
});
