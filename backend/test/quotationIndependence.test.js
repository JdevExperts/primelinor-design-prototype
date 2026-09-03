const test = require("node:test");
const assert = require("node:assert/strict");

const {
  canCreateRevision,
  canEditInPlace,
  canCancel,
  isExpired,
  revisionCta,
  REVISABLE_STATUSES,
} = require("../src/services/quotationEligibility");
const {
  hasPendingRevisionRequest,
  pendingRevisionRequestRow,
  classifyRevisionRequest,
  newerDraftVersion,
} = require("../src/services/quotationRevisionRules");
const { partyFromQuotation } = require("../src/services/quotationService");

// ── A. canCreateRevision — the P0 rule ────────────────────────────────

test("A. canCreateRevision: every issued status is revisable, DRAFT/CANCELLED are not", () => {
  assert.equal(canCreateRevision("DRAFT"), false);
  assert.equal(canCreateRevision("SENT"), true);
  assert.equal(canCreateRevision("VIEWED"), true);
  assert.equal(canCreateRevision("ACCEPTED"), true);
  assert.equal(canCreateRevision("REJECTED"), true);
  assert.equal(canCreateRevision("SUPERSEDED"), true);
  assert.equal(canCreateRevision("CANCELLED"), false);
});

test("A. REVISABLE_STATUSES is the single source, no DRAFT", () => {
  assert.deepEqual(REVISABLE_STATUSES, ["SENT", "VIEWED", "ACCEPTED", "REJECTED", "SUPERSEDED"]);
});

test("A. canEditInPlace: only DRAFT", () => {
  assert.equal(canEditInPlace("DRAFT"), true);
  for (const s of ["SENT", "VIEWED", "ACCEPTED", "REJECTED", "SUPERSEDED", "CANCELLED"]) {
    assert.equal(canEditInPlace(s), false);
  }
});

test("A. canCancel: DRAFT/SENT/VIEWED only", () => {
  assert.deepEqual(
    ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "SUPERSEDED", "CANCELLED"].filter(canCancel),
    ["DRAFT", "SENT", "VIEWED"],
  );
});

test("A. revisionCta: per-status label + confirm copy", () => {
  assert.equal(revisionCta("DRAFT").editInPlace, true);
  assert.equal(revisionCta("SENT").label, "Create New Version");
  assert.equal(revisionCta("VIEWED").label, "Create New Version");
  assert.match(revisionCta("ACCEPTED").label, /Revised Version/);
  assert.match(revisionCta("ACCEPTED").confirm, /already been accepted/);
  assert.equal(revisionCta("REJECTED").label, "Create Revised Offer");
  assert.match(revisionCta("SUPERSEDED").label, /baseline/);
  assert.equal(revisionCta("CANCELLED"), null);
});

// ── N. Expired flag ──────────────────────────────────────────────────

test("N. isExpired: only a live offer past its valid-until date", () => {
  const past = new Date(Date.now() - 86_400_000);
  const future = new Date(Date.now() + 86_400_000);
  assert.equal(isExpired({ status: "SENT", validUntil: past }), true);
  assert.equal(isExpired({ status: "VIEWED", validUntil: past }), true);
  assert.equal(isExpired({ status: "SENT", validUntil: future }), false);
  assert.equal(isExpired({ status: "SENT", validUntil: null }), false);
  // Historical states are never "expired".
  assert.equal(isExpired({ status: "ACCEPTED", validUntil: past }), false);
  assert.equal(isExpired({ status: "SUPERSEDED", validUntil: past }), false);
  assert.equal(isExpired({ status: "CANCELLED", validUntil: past }), false);
});

// ── G/H (pure part). Party carry-forward ─────────────────────────────

test("G. partyFromQuotation: clones the source version's own snapshot, not the RFQ", () => {
  const source = {
    partyName: "Acme Corp",
    partyContactPerson: "Priya",
    partyPhone: "98765 43210",
    partyEmail: "priya@acme.com",
    partyGstin: "29ABCDE1234F1Z5", // corrected by sales on V1
    partyAddress: "MG Road, Bengaluru",
  };
  const carried = partyFromQuotation(source);
  assert.equal(carried.partyGstin, "29ABCDE1234F1Z5");
  assert.equal(carried.partyAddress, "MG Road, Bengaluru");
  assert.equal(carried.partyName, "Acme Corp");
});

// ── K. Customer revision-request deduplication ───────────────────────

function row(type, createdAt, message) {
  return { id: `${type}-${createdAt}`, type, createdAt: new Date(createdAt), metadata: message ? { message } : {} };
}

test("K. classifyRevisionRequest: first request always inserts", () => {
  assert.deepEqual(classifyRevisionRequest([], "Lower the price"), { action: "insert" });
});

test("K. classifyRevisionRequest: identical repeat only touches the pending row", () => {
  const activity = [row("CUSTOMER_REVISION_REQUESTED", "2026-09-01T10:00:00Z", "Lower the price")];
  const d = classifyRevisionRequest(activity, "Lower the price");
  assert.equal(d.action, "touch");
  assert.equal(d.rowId, activity[0].id);
});

test("K. classifyRevisionRequest: empty repeat message touches, does not stack", () => {
  const activity = [row("CUSTOMER_REVISION_REQUESTED", "2026-09-01T10:00:00Z", "Lower the price")];
  assert.equal(classifyRevisionRequest(activity, "").action, "touch");
  assert.equal(classifyRevisionRequest(activity, undefined).action, "touch");
});

test("K. classifyRevisionRequest: a genuinely different message inserts (never lost)", () => {
  const activity = [row("CUSTOMER_REVISION_REQUESTED", "2026-09-01T10:00:00Z", "Lower the price")];
  assert.equal(classifyRevisionRequest(activity, "Also need it in navy").action, "insert");
});

test("K. classifyRevisionRequest: after the request was addressed, a new request inserts", () => {
  const activity = [
    row("REVISION_REQUEST_ADDRESSED", "2026-09-02T09:00:00Z"),
    row("CUSTOMER_REVISION_REQUESTED", "2026-09-01T10:00:00Z", "Lower the price"),
  ];
  assert.equal(classifyRevisionRequest(activity, "Lower the price").action, "insert");
});

// ── L. Pending-request resolution ───────────────────────────────────

test("L. hasPendingRevisionRequest: true only while the request is the latest workflow event", () => {
  assert.equal(hasPendingRevisionRequest([row("CUSTOMER_REVISION_REQUESTED", "2026-09-01T10:00:00Z")]), true);
  assert.equal(
    hasPendingRevisionRequest([
      row("QUOTATION_REVISION_CREATED", "2026-09-02T09:00:00Z"),
      row("CUSTOMER_REVISION_REQUESTED", "2026-09-01T10:00:00Z"),
    ]),
    false,
  );
  assert.equal(
    hasPendingRevisionRequest([
      row("REVISION_REQUEST_ADDRESSED", "2026-09-02T09:00:00Z"),
      row("CUSTOMER_REVISION_REQUESTED", "2026-09-01T10:00:00Z"),
    ]),
    false,
  );
  assert.equal(hasPendingRevisionRequest([row("QUOTATION_VIEWED", "2026-09-03T09:00:00Z")]), false);
});

test("L. pendingRevisionRequestRow returns the row or null", () => {
  const activity = [row("CUSTOMER_REVISION_REQUESTED", "2026-09-01T10:00:00Z", "cheaper")];
  assert.equal(pendingRevisionRequestRow(activity).metadata.message, "cheaper");
  assert.equal(pendingRevisionRequestRow([row("QUOTATION_ACCEPTED", "2026-09-04T09:00:00Z")]), null);
});

// ── O. Existing-draft protection ────────────────────────────────────

test("O. newerDraftVersion: finds a DRAFT newer than the source version", () => {
  const versions = [
    { id: "v1", version: 1, status: "SUPERSEDED" },
    { id: "v2", version: 2, status: "SENT" },
    { id: "v3", version: 3, status: "DRAFT" },
  ];
  assert.equal(newerDraftVersion(versions, 2).id, "v3");
  assert.equal(newerDraftVersion(versions, 3), null);
});

test("O. newerDraftVersion: no draft → null", () => {
  const versions = [
    { id: "v1", version: 1, status: "SUPERSEDED" },
    { id: "v2", version: 2, status: "ACCEPTED" },
  ];
  assert.equal(newerDraftVersion(versions, 1), null);
});
