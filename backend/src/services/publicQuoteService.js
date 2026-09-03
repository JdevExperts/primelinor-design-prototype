/**
 * Token-gated customer quotation access (Phase 4). Every lookup here is by
 * hashed token only — never by RFQ/quotation reference or internal id —
 * and every failure path (not found, wrong hash, revoked, still DRAFT)
 * returns the exact same generic error, so a token-guessing attempt can't
 * distinguish "no such token" from "token exists but is revoked" (§39).
 */
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { hashToken } = require("./quoteToken");
const { recordActivity } = require("./rfqActivity");
const { classifyRevisionRequest } = require("./quotationRevisionRules");

const CUSTOMER_ACTIVITY_TYPES = [
  "CUSTOMER_REVISION_REQUESTED",
  "REVISION_REQUEST_ADDRESSED",
  "QUOTATION_REVISION_CREATED",
  "QUOTATION_ACCEPTED",
  "QUOTATION_REJECTED",
  "QUOTATION_CANCELLED",
];

/** Workflow activity for one quotation version — MANUAL (quotationId) or
 *  RFQ-origin (rfqId-scoped, quotationId in metadata). */
async function loadVersionActivity(quotation) {
  return prisma.rFQActivity.findMany({
    where: {
      type: { in: CUSTOMER_ACTIVITY_TYPES },
      OR: [{ quotationId: quotation.id }, { metadata: { path: ["quotationId"], equals: quotation.id } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

const DETAIL_INCLUDE = {
  lines: { orderBy: { sortOrder: "asc" } },
  rfq: { include: { contact: { include: { company: true } } } },
};

const INVALID_LINK = "This quotation link is invalid or no longer active.";

function isExpired(quotation) {
  return Boolean(quotation.validUntil && quotation.validUntil.getTime() < Date.now());
}

function actionEligibility(quotation, rfq) {
  const expired = isExpired(quotation);
  // A MANUAL quotation has no RFQ to close, so revision requests stay open.
  const rfqOpen = !rfq || !["WON", "LOST", "CANCELLED"].includes(rfq.status);
  // A staff-cancelled quotation offers no customer actions at all.
  const cancelled = quotation.status === "CANCELLED";
  return {
    canAccept: !cancelled && ["SENT", "VIEWED"].includes(quotation.status) && !expired,
    canDecline: !cancelled && ["SENT", "VIEWED"].includes(quotation.status),
    canRequestRevision: !cancelled && ["SENT", "VIEWED", "REJECTED"].includes(quotation.status) && rfqOpen,
    isExpired: expired,
    isCancelled: cancelled,
  };
}

/**
 * Looks up a quotation by raw token and, on a first successful view of a
 * SENT quote, transitions it to VIEWED (once — a refresh never repeats
 * this). Superseded/rejected/accepted quotations remain viewable (their
 * own token stays valid for historical clarity, per §4/§31/§32/§33); only
 * DRAFT is truly unreachable, and DRAFT never has a token in the first
 * place.
 */
async function resolveQuoteByToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string") throw ApiError.notFound(INVALID_LINK);

  const hash = hashToken(rawToken);
  let quotation = await prisma.quotation.findUnique({ where: { accessTokenHash: hash }, include: DETAIL_INCLUDE });

  if (!quotation) throw ApiError.notFound(INVALID_LINK);
  // A staff cancellation revokes the token (§12) but the holder of that
  // exact link still sees a clear "no longer active" page (§23) rather
  // than the generic invalid-link 404 — a guessed token still 404s.
  if (quotation.accessTokenRevokedAt && quotation.status !== "CANCELLED") {
    throw ApiError.notFound(INVALID_LINK);
  }

  if (quotation.status === "SENT" && !quotation.viewedAt) {
    quotation = await prisma.$transaction(async (tx) => {
      const updated = await tx.quotation.update({
        where: { id: quotation.id },
        data: { status: "VIEWED", viewedAt: new Date() },
        include: DETAIL_INCLUDE,
      });
      await recordActivity(tx, {
        ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: quotation.id }),
        type: "QUOTATION_VIEWED",
        actorType: "CUSTOMER",
        metadata: { quotationId: quotation.id, version: quotation.version },
      });
      return updated;
    });
  }

  return { quotation, eligibility: actionEligibility(quotation, quotation.rfq) };
}

async function requireActionableQuote(rawToken) {
  const hash = hashToken(rawToken || "");
  const quotation = await prisma.quotation.findUnique({ where: { accessTokenHash: hash }, include: DETAIL_INCLUDE });
  if (!quotation || quotation.accessTokenRevokedAt) throw ApiError.notFound(INVALID_LINK);
  return quotation;
}

/** Idempotent: an already-ACCEPTED quotation just returns its current state (§12). */
async function acceptQuoteByToken(rawToken) {
  const quotation = await requireActionableQuote(rawToken);
  if (quotation.status === "ACCEPTED") return quotation;

  const eligibility = actionEligibility(quotation, quotation.rfq);
  if (!eligibility.canAccept) {
    throw ApiError.badRequest(
      eligibility.isExpired ? "This quotation has expired." : "This quotation can no longer be accepted.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const accepted = await tx.quotation.update({
      where: { id: quotation.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
      include: DETAIL_INCLUDE,
    });

    await recordActivity(tx, {
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: quotation.id }),
      type: "QUOTATION_ACCEPTED",
      actorType: "CUSTOMER",
      metadata: { quotationId: quotation.id, version: quotation.version },
    });

    // A MANUAL quotation has no RFQ to move to WON.
    if (quotation.rfqId) {
      await tx.rFQ.update({ where: { id: quotation.rfqId }, data: { status: "WON" } });
      await recordActivity(tx, {
        rfqId: quotation.rfqId,
        type: "STATUS_CHANGED",
        actorType: "CUSTOMER",
        metadata: { from: quotation.rfq.status, to: "WON", reason: "customer_accepted" },
      });
    }

    return accepted;
  });
}

/**
 * A customer decline never moves the RFQ to LOST on its own (Phase 3's
 * own staff-reject flow already established that a rejection isn't
 * necessarily final — a revision may follow). Since there's no staff
 * present to make an explicit choice the way Phase 3's admin flow
 * requires, the deliberate default here is RFQ -> NEGOTIATING: a decline
 * is read as "not this, but let's keep talking," which is the common
 * real-world case and keeps the RFQ open for a revision. Staff can still
 * move it to LOST manually from the RFQ detail page if the deal is
 * actually dead.
 */
async function declineQuoteByToken(rawToken, message) {
  const quotation = await requireActionableQuote(rawToken);
  const eligibility = actionEligibility(quotation, quotation.rfq);
  if (!eligibility.canDecline) {
    throw ApiError.badRequest("This quotation has already been responded to.");
  }

  return prisma.$transaction(async (tx) => {
    const rejected = await tx.quotation.update({
      where: { id: quotation.id },
      data: { status: "REJECTED", respondedAt: new Date() },
      include: DETAIL_INCLUDE,
    });

    await recordActivity(tx, {
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: quotation.id }),
      type: "QUOTATION_REJECTED",
      actorType: "CUSTOMER",
      metadata: { quotationId: quotation.id, version: quotation.version, message: message || undefined },
    });

    if (quotation.rfqId && !["WON", "LOST", "CANCELLED"].includes(quotation.rfq.status)) {
      await tx.rFQ.update({ where: { id: quotation.rfqId }, data: { status: "NEGOTIATING" } });
      await recordActivity(tx, {
        rfqId: quotation.rfqId,
        type: "STATUS_CHANGED",
        actorType: "CUSTOMER",
        metadata: { from: quotation.rfq.status, to: "NEGOTIATING", reason: "customer_declined" },
      });
    }

    return rejected;
  });
}

async function requestRevisionByToken(rawToken, message) {
  const quotation = await requireActionableQuote(rawToken);
  const eligibility = actionEligibility(quotation, quotation.rfq);
  if (!eligibility.canRequestRevision) {
    throw ApiError.badRequest("This quotation can no longer receive revision requests.");
  }

  // Deduplicate repeat clicks (§10): if the latest unresolved customer
  // event is already a revision request with the same (or no) message,
  // just bump its timestamp instead of stacking an identical row. A
  // genuinely different, non-empty message always inserts a new row.
  const priorActivity = await loadVersionActivity(quotation);
  const decision = classifyRevisionRequest(priorActivity, message);

  return prisma.$transaction(async (tx) => {
    if (decision.action === "touch") {
      await tx.rFQActivity.update({ where: { id: decision.rowId }, data: { createdAt: new Date() } });
    } else {
      await recordActivity(tx, {
        ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: quotation.id }),
        type: "CUSTOMER_REVISION_REQUESTED",
        actorType: "CUSTOMER",
        metadata: { quotationId: quotation.id, version: quotation.version, message: message || undefined },
      });
    }

    // Bump the quotation so it rises to the top of the Quotations list
    // (ordered by updatedAt) — a revision request needs attention.
    await tx.quotation.update({ where: { id: quotation.id }, data: { updatedAt: new Date() } });

    if (quotation.rfqId && !["WON", "LOST", "CANCELLED"].includes(quotation.rfq.status)) {
      await tx.rFQ.update({ where: { id: quotation.rfqId }, data: { status: "NEGOTIATING" } });
      await recordActivity(tx, {
        rfqId: quotation.rfqId,
        type: "STATUS_CHANGED",
        actorType: "CUSTOMER",
        metadata: { from: quotation.rfq.status, to: "NEGOTIATING", reason: "customer_revision_requested" },
      });
    }

    return tx.quotation.findUnique({ where: { id: quotation.id }, include: DETAIL_INCLUDE });
  });
}

module.exports = {
  resolveQuoteByToken,
  acceptQuoteByToken,
  declineQuoteByToken,
  requestRevisionByToken,
  actionEligibility,
  isExpired,
  INVALID_LINK,
};
