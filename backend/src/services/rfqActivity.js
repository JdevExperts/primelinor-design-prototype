/**
 * Single place that writes RFQActivity rows, so every admin action logs a
 * consistent shape. `db` may be the shared prisma client or a transaction
 * client — every caller that changes multiple records alongside an
 * activity row passes its transaction here (Phase 3 §46).
 */
const ACTIVITY_TYPES = [
  "RFQ_CREATED",
  "STATUS_CHANGED",
  "ASSIGNED",
  "NOTE_ADDED",
  "QUOTATION_CREATED",
  "QUOTATION_UPDATED",
  "QUOTATION_SENT",
  "QUOTATION_REVISION_CREATED",
  "QUOTATION_ACCEPTED",
  "QUOTATION_REJECTED",
  "QUOTATION_CANCELLED",
  // Phase 4 — customer-facing quote delivery
  "QUOTATION_VIEWED",
  "CUSTOMER_REVISION_REQUESTED",
  "REVISION_REQUEST_ADDRESSED",
  "QUOTE_LINK_REGENERATED",
  "QUOTE_LINK_REVOKED",
  // Phase C — RFQ working requirement
  "RFQ_WORKING_ITEM_ADDED",
  "RFQ_WORKING_ITEM_UPDATED",
  "RFQ_WORKING_ITEM_REMOVED",
  "RFQ_REQUIREMENT_UPDATED",
];

/**
 * Writes one activity row. Scoped to `rfqId` (RFQ workflow) OR `quotationId`
 * (a MANUAL quotation's own lifecycle — Phase E) — exactly one is set.
 */
async function recordActivity(db, { rfqId, quotationId, type, actorType, actorId, metadata }) {
  return db.rFQActivity.create({
    data: {
      rfqId: rfqId || null,
      quotationId: quotationId || null,
      type,
      actorType,
      actorId: actorId || null,
      metadata: metadata || null,
    },
  });
}

/** Convenience wrapper for the common "a staff member did X" case. */
async function recordStaffActivity(db, { rfqId, quotationId, type, staffUserId, metadata }) {
  return recordActivity(db, { rfqId, quotationId, type, actorType: "STAFF", actorId: staffUserId, metadata });
}

module.exports = { ACTIVITY_TYPES, recordActivity, recordStaffActivity };
