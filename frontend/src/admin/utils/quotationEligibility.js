/**
 * Frontend mirror of backend src/services/quotationEligibility.js — kept
 * deliberately tiny and in lockstep. The backend is authoritative (its
 * `canCreateRevision` / `revisionCta` come down on the quotation detail);
 * this is the fallback for optimistic UI before that payload lands.
 */

export const REVISABLE_STATUSES = ["SENT", "VIEWED", "ACCEPTED", "REJECTED", "SUPERSEDED"];
export const CANCELLABLE_STATUSES = ["DRAFT", "SENT", "VIEWED"];

export function canCreateRevision(status) {
  return REVISABLE_STATUSES.includes(status);
}

export function canEditInPlace(status) {
  return status === "DRAFT";
}

export function canCancel(status) {
  return CANCELLABLE_STATUSES.includes(status);
}

export function revisionCta(status) {
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
