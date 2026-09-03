/**
 * Pure helpers for the revision / customer-revision-request workflow.
 * No Prisma, no I/O — the service passes already-loaded rows in.
 */

// Activity types that "answer" a customer revision request, newest of
// which decides whether a request is still pending.
const RESOLVING_TYPES = [
  "CUSTOMER_REVISION_REQUESTED",
  "REVISION_REQUEST_ADDRESSED",
  "QUOTATION_REVISION_CREATED",
  "QUOTATION_ACCEPTED",
  "QUOTATION_REJECTED",
  "QUOTATION_CANCELLED",
];

/** newest-first list of {type, createdAt, metadata} for one quotation version. */
function sortByCreatedDesc(rows) {
  return (rows || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * True when the most recent workflow event on this version is an
 * unanswered customer revision request.
 */
function hasPendingRevisionRequest(activityRows) {
  for (const row of sortByCreatedDesc(activityRows)) {
    if (!RESOLVING_TYPES.includes(row.type)) continue;
    return row.type === "CUSTOMER_REVISION_REQUESTED";
  }
  return false;
}

/**
 * The newest still-pending customer revision request row, or null. Used
 * to decide whether a repeat request is a duplicate.
 */
function pendingRevisionRequestRow(activityRows) {
  const sorted = sortByCreatedDesc(activityRows);
  for (const row of sorted) {
    if (!RESOLVING_TYPES.includes(row.type)) continue;
    return row.type === "CUSTOMER_REVISION_REQUESTED" ? row : null;
  }
  return null;
}

/**
 * Decide how to handle an incoming customer revision request.
 *  - "insert": genuinely new (first request, or a different message)
 *  - "touch":  a duplicate of the pending one — bump its timestamp only
 * A different, non-empty message is never lost — it inserts.
 */
function classifyRevisionRequest(activityRows, incomingMessage) {
  const pending = pendingRevisionRequestRow(activityRows);
  if (!pending) return { action: "insert" };
  const prev = (pending.metadata && pending.metadata.message) || "";
  const next = (incomingMessage || "").trim();
  if (!next || next === prev.trim()) return { action: "touch", rowId: pending.id };
  return { action: "insert" };
}

/**
 * Among a group's versions, the DRAFT one newer than `fromVersion` (if
 * any). Blocks a second revision draft and powers the "newer draft
 * exists" hint.
 */
function newerDraftVersion(versions, fromVersion) {
  return (
    (versions || [])
      .filter((v) => v.status === "DRAFT" && v.version > fromVersion)
      .sort((a, b) => a.version - b.version)[0] || null
  );
}

module.exports = {
  RESOLVING_TYPES,
  hasPendingRevisionRequest,
  pendingRevisionRequestRow,
  classifyRevisionRequest,
  newerDraftVersion,
};
