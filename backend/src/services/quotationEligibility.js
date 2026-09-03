/**
 * Pure, dependency-free rules about what can be done with a quotation
 * version in a given status. The single source of truth — the backend
 * service, the admin serializer and (mirrored) the frontend all defer to
 * this so a status array is never duplicated and drift is impossible.
 */

// Statuses a NEW version can be branched from. DRAFT is excluded on
// purpose: a draft is edited in place, never superseded. CANCELLED is a
// dead end. Every other issued state — including ACCEPTED, REJECTED and
// SUPERSEDED — can seed a fresh commercial offer, with no dependency on a
// customer revision request.
const REVISABLE_STATUSES = ["SENT", "VIEWED", "ACCEPTED", "REJECTED", "SUPERSEDED"];

// Statuses a staff member may still cancel/void from.
const CANCELLABLE_STATUSES = ["DRAFT", "SENT", "VIEWED"];

function canCreateRevision(status) {
  return REVISABLE_STATUSES.includes(status);
}

function canEditInPlace(status) {
  return status === "DRAFT";
}

function canCancel(status) {
  return CANCELLABLE_STATUSES.includes(status);
}

/**
 * Computed expiry — never a stored status. A quotation is "expired" only
 * while it is a live offer (SENT/VIEWED) past its valid-until date;
 * superseded/accepted/rejected/cancelled versions are historical, not
 * "expired".
 */
function isExpired(quotation) {
  if (!quotation || !quotation.validUntil) return false;
  if (!["SENT", "VIEWED"].includes(quotation.status)) return false;
  const until = quotation.validUntil instanceof Date ? quotation.validUntil : new Date(quotation.validUntil);
  return until.getTime() < Date.now();
}

/**
 * The label + optional confirmation copy for the "create a new version"
 * call to action, per source status. Mirrored on the frontend.
 */
function revisionCta(status) {
  switch (status) {
    case "DRAFT":
      return { label: "Edit quotation", editInPlace: true };
    case "SENT":
    case "VIEWED":
      return { label: "Create New Version" };
    case "ACCEPTED":
      return {
        label: "Create Revised Version",
        confirm:
          "This quotation has already been accepted. Creating a new version starts a new commercial offer while preserving the accepted version.",
      };
    case "REJECTED":
      return { label: "Create Revised Offer" };
    case "SUPERSEDED":
      return { label: "Create New Version from this baseline" };
    default:
      return null;
  }
}

module.exports = {
  REVISABLE_STATUSES,
  CANCELLABLE_STATUSES,
  canCreateRevision,
  canEditInPlace,
  canCancel,
  isExpired,
  revisionCta,
};
