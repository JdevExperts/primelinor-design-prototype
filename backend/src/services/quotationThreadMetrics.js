/**
 * Business-level quotation metrics count THREADS, never individual
 * versions (§24/§25). A thread = one `quotationGroupId` = V1→V2→V3…
 *
 * Definitions (kept transparent on purpose):
 *   - latest version .......... the row with the highest `version` in the group
 *   - thread status ........... the latest version's status, EXCEPT a thread
 *                               with ANY ACCEPTED version counts as ACCEPTED
 *                               (staff-accept marks that version ACCEPTED
 *                               without superseding it — the deal is won)
 *   - reached customer ....... the thread has ≥1 version in SENT/VIEWED/
 *                               ACCEPTED/REJECTED (states only reachable
 *                               after a send)
 *   - active ................. latest status is DRAFT, SENT or VIEWED and the
 *                               thread is not accepted/expired
 *   - expired ............... latest status is SENT/VIEWED and its
 *                               validUntil is in the past (computed, never a
 *                               stored status — §13)
 *   - pending revision ...... the latest version carries an unresolved
 *                               customer revision request
 *   - Total Quoted Value .... Σ over threads of the grandTotal of the most
 *                               recent SENT-or-later version (a bare DRAFT
 *                               contributes 0)
 *   - Accepted Value ....... Σ over threads of the ACCEPTED version's grandTotal
 *   - Acceptance Rate ...... acceptedThreads / threadsThatReachedCustomer
 */

const SENT_OR_LATER = new Set(["SENT", "VIEWED", "ACCEPTED", "REJECTED"]);

/**
 * @param {Array} versionRows  every version row across all threads, each:
 *   { quotationGroupId, version, status, grandTotal, validUntil, pendingRevision }
 * @param {Date} now
 */
function summariseThreads(versionRows, now = new Date()) {
  const groups = new Map();
  for (const r of versionRows || []) {
    const g = groups.get(r.quotationGroupId) || [];
    g.push(r);
    groups.set(r.quotationGroupId, g);
  }

  const out = {
    totalThreads: groups.size,
    byStatus: { DRAFT: 0, SENT: 0, VIEWED: 0, ACCEPTED: 0, REJECTED: 0, CANCELLED: 0 },
    active: 0,
    expired: 0,
    pendingRevision: 0,
    reachedCustomer: 0,
    quotedValue: 0,
    acceptedValue: 0,
    acceptanceRate: null,
  };

  for (const versions of groups.values()) {
    const sorted = versions.slice().sort((a, b) => b.version - a.version);
    const latest = sorted[0];
    const acceptedRow = sorted.find((v) => v.status === "ACCEPTED") || null;
    const reached = sorted.some((v) => SENT_OR_LATER.has(v.status));
    const lastSent = sorted.find((v) => SENT_OR_LATER.has(v.status)) || null;

    const effectiveStatus = acceptedRow ? "ACCEPTED" : latest.status;
    if (out.byStatus[effectiveStatus] != null) out.byStatus[effectiveStatus] += 1;

    const isExpired =
      !acceptedRow &&
      ["SENT", "VIEWED"].includes(latest.status) &&
      latest.validUntil &&
      new Date(latest.validUntil).getTime() < now.getTime();
    if (isExpired) out.expired += 1;

    if (!acceptedRow && !isExpired && ["DRAFT", "SENT", "VIEWED"].includes(latest.status)) out.active += 1;
    if (latest.pendingRevision) out.pendingRevision += 1;
    if (reached) out.reachedCustomer += 1;

    if (lastSent && lastSent.grandTotal != null) out.quotedValue += Number(lastSent.grandTotal);
    if (acceptedRow && acceptedRow.grandTotal != null) out.acceptedValue += Number(acceptedRow.grandTotal);
  }

  out.quotedValue = Math.round(out.quotedValue * 100) / 100;
  out.acceptedValue = Math.round(out.acceptedValue * 100) / 100;
  out.acceptanceRate =
    out.reachedCustomer > 0 ? Math.round((out.byStatus.ACCEPTED / out.reachedCustomer) * 1000) / 10 : null;

  return out;
}

module.exports = { summariseThreads, SENT_OR_LATER };
