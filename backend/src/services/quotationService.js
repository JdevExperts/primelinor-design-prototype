const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { computeQuotationTotals } = require("./quotationTotals");
const { recordStaffActivity } = require("./rfqActivity");
const { generateToken } = require("./quoteToken");
const { isUniqueConstraintOn } = require("../utils/prismaErrors");

const LINES_INCLUDE = { lines: { orderBy: { sortOrder: "asc" } }, createdBy: true };

async function listQuotationsForRfq(rfqId) {
  return prisma.quotation.findMany({
    where: { rfqId },
    include: LINES_INCLUDE,
    orderBy: { version: "desc" },
  });
}

async function getQuotation(id) {
  const quotation = await prisma.quotation.findUnique({ where: { id }, include: LINES_INCLUDE });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  return quotation;
}

function assertEditable(quotation) {
  if (quotation.status !== "DRAFT") {
    throw ApiError.badRequest(`A ${quotation.status.toLowerCase()} quotation can't be edited — only DRAFT.`);
  }
}

async function writeLines(tx, quotationId, lines) {
  await tx.quotationLine.deleteMany({ where: { quotationId } });
  if (!lines.length) return;
  await tx.quotationLine.createMany({
    data: lines.map((line) => ({
      quotationId,
      rfqItemId: line.rfqItemId || null,
      lineType: line.lineType,
      description: line.description,
      quantity: line.quantity ?? null,
      unit: line.unit || null,
      unitPrice: line.unitPrice ?? null,
      lineTotal: line.lineTotal,
      sortOrder: line.sortOrder,
      metadata: line.metadata || null,
    })),
  });
}

/**
 * Creates a new quotation version for an RFQ. `supersedesId`, when given,
 * marks this as a revision of a SENT quotation — the prior row is NOT
 * flipped to SUPERSEDED here (Phase 3 §24: that only happens once THIS new
 * version is actually SENT, so the currently-valid sent quote stays
 * visible/valid while the revision is still a draft).
 */
async function createQuotation(rfqId, staffUser, payload) {
  const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });
  if (!rfq) throw ApiError.notFound("RFQ not found");

  let supersedes = null;
  if (payload.supersedesId) {
    supersedes = await prisma.quotation.findUnique({ where: { id: payload.supersedesId } });
    if (!supersedes || supersedes.rfqId !== rfqId) {
      throw ApiError.badRequest("The quotation being revised was not found on this RFQ.");
    }
    // VIEWED is just a SENT quotation the customer has opened — Phase 4
    // introduced that status, and a revision request typically arrives
    // right after the customer views it, so it must stay revisable.
    if (!["SENT", "VIEWED"].includes(supersedes.status)) {
      throw ApiError.badRequest("Only a sent (or viewed) quotation can be revised.");
    }
  }

  const { lines, subtotal, grandTotal } = computeQuotationTotals(payload.lines || [], payload.taxAmount);
  const lastVersion = await prisma.quotation.aggregate({ where: { rfqId }, _max: { version: true } });
  const version = (lastVersion._max.version || 0) + 1;

  // `version` is read-then-written (MAX+1) — two concurrent "Create
  // Revision" calls on the same RFQ can both read the same max and race
  // to insert it. The @@unique([rfqId, version]) constraint is what
  // actually prevents a corrupted duplicate-version row; this catch turns
  // the loser's raw P2002 into a clear, actionable 409 instead of a
  // generic 500 (Production Hardening Patch §10). No retry loop — the
  // caller (staff clicking a button) is the right place to decide whether
  // to retry with fresh data.
  try {
    return await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          rfqId,
          version,
          supersedesId: supersedes?.id || null,
          currency: payload.currency || "INR",
          subtotal,
          taxMode: payload.taxMode || null,
          taxAmount: payload.taxAmount ?? null,
          grandTotal,
          validUntil: payload.validUntil ? new Date(payload.validUntil) : null,
          customerNotes: payload.customerNotes || null,
          createdByUserId: staffUser.id,
        },
      });
      await writeLines(tx, quotation.id, lines);

      await recordStaffActivity(tx, {
        rfqId,
        type: supersedes ? "QUOTATION_REVISION_CREATED" : "QUOTATION_CREATED",
        staffUserId: staffUser.id,
        metadata: { quotationId: quotation.id, version, supersedesId: supersedes?.id || null },
      });

      return tx.quotation.findUnique({ where: { id: quotation.id }, include: LINES_INCLUDE });
    });
  } catch (err) {
    if (isUniqueConstraintOn(err, "version")) {
      throw ApiError.conflict("Another quotation revision was created at the same time. Refresh and try again.");
    }
    throw err;
  }
}

async function updateQuotation(id, staffUser, payload) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  assertEditable(quotation);

  const { lines, subtotal, grandTotal } = computeQuotationTotals(payload.lines || [], payload.taxAmount);

  return prisma.$transaction(async (tx) => {
    await writeLines(tx, id, lines);
    const updated = await tx.quotation.update({
      where: { id },
      data: {
        currency: payload.currency || quotation.currency,
        subtotal,
        taxMode: payload.taxMode ?? quotation.taxMode,
        taxAmount: payload.taxAmount ?? null,
        grandTotal,
        validUntil: payload.validUntil ? new Date(payload.validUntil) : null,
        customerNotes: payload.customerNotes ?? quotation.customerNotes,
      },
      include: LINES_INCLUDE,
    });

    await recordStaffActivity(tx, {
      rfqId: quotation.rfqId,
      type: "QUOTATION_UPDATED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version },
    });

    return updated;
  });
}

/**
 * "Send" is operational only (Phase 3 §23/§53) — freezes the quotation and
 * marks the RFQ QUOTED where that's a forward step, not a regression. No
 * email/WhatsApp delivery happens here or anywhere yet.
 *
 * Phase 4 §22: sending also mints the customer access token. The raw token
 * is attached to the returned object as `.rawAccessToken` — a value that
 * exists only in this one response and is never persisted or retrievable
 * again (only its hash is stored). If staff navigate away without copying
 * it, the only way to get a working link again is `regenerateAccessToken`.
 */
async function sendQuotation(id, staffUser) {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  assertEditable(quotation);
  if (!quotation.lines.length) {
    throw ApiError.badRequest("Add at least one line before sending a quotation.");
  }

  const { raw, hash } = generateToken();

  const sent = await prisma.$transaction(async (tx) => {
    const updated = await tx.quotation.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        accessTokenHash: hash,
        accessTokenCreatedAt: new Date(),
        accessTokenRevokedAt: null,
      },
      include: LINES_INCLUDE,
    });

    if (quotation.supersedesId) {
      await tx.quotation.update({ where: { id: quotation.supersedesId }, data: { status: "SUPERSEDED" } });
    }

    await recordStaffActivity(tx, {
      rfqId: quotation.rfqId,
      type: "QUOTATION_SENT",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version, grandTotal: Number(updated.grandTotal) },
    });

    const rfq = await tx.rFQ.findUnique({ where: { id: quotation.rfqId } });
    if (rfq.status === "NEW" || rfq.status === "IN_PROGRESS") {
      await tx.rFQ.update({ where: { id: rfq.id }, data: { status: "QUOTED" } });
      await recordStaffActivity(tx, {
        rfqId: quotation.rfqId,
        type: "STATUS_CHANGED",
        staffUserId: staffUser.id,
        metadata: { from: rfq.status, to: "QUOTED", reason: "quotation_sent" },
      });
    }

    return updated;
  });

  sent.rawAccessToken = raw;
  return sent;
}

/**
 * Admin-triggered link rotation (Phase 4 §5) — e.g. "link accidentally
 * shared" or "customer asks for a new link". Overwriting the hash makes
 * the previous raw token permanently unusable; no separate revoke step is
 * needed first. Only meaningful on a SENT (or later) quotation — a DRAFT
 * has no customer-facing existence yet.
 *
 * The Quotation row update and its RFQActivity row are wrapped in one
 * transaction (Production Hardening Patch §11/§J) — previously these were
 * two separate statements, so a crash between them could leave a working
 * new link with no audit trail of the rotation ever having happened.
 */
async function regenerateAccessToken(id, staffUser) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  if (quotation.status === "DRAFT") {
    throw ApiError.badRequest("Send the quotation before generating a customer link.");
  }

  const { raw, hash } = generateToken();

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.quotation.update({
      where: { id },
      data: { accessTokenHash: hash, accessTokenCreatedAt: new Date(), accessTokenRevokedAt: null },
      include: LINES_INCLUDE,
    });

    await recordStaffActivity(tx, {
      rfqId: quotation.rfqId,
      type: "QUOTE_LINK_REGENERATED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version },
    });

    return result;
  });

  updated.rawAccessToken = raw;
  return updated;
}

/** Disables the current customer link without issuing a new one (Phase 4 §5). */
async function revokeAccessToken(id, staffUser) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  if (!quotation.accessTokenHash || quotation.accessTokenRevokedAt) {
    throw ApiError.badRequest("This quotation has no active customer link.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.quotation.update({
      where: { id },
      data: { accessTokenRevokedAt: new Date() },
      include: LINES_INCLUDE,
    });

    await recordStaffActivity(tx, {
      rfqId: quotation.rfqId,
      type: "QUOTE_LINK_REVOKED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version },
    });

    return result;
  });

  return updated;
}

async function acceptQuotation(id, staffUser) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  // VIEWED is a SENT quotation the customer has opened — still acceptable
  // (e.g. staff marking it accepted after a phone confirmation).
  if (!["SENT", "VIEWED"].includes(quotation.status)) {
    throw ApiError.badRequest("Only a sent quotation can be accepted.");
  }

  return prisma.$transaction(async (tx) => {
    const accepted = await tx.quotation.update({
      where: { id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
      include: LINES_INCLUDE,
    });

    const rfq = await tx.rFQ.findUnique({ where: { id: quotation.rfqId } });
    await tx.rFQ.update({ where: { id: quotation.rfqId }, data: { status: "WON" } });

    await recordStaffActivity(tx, {
      rfqId: quotation.rfqId,
      type: "QUOTATION_ACCEPTED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version },
    });
    await recordStaffActivity(tx, {
      rfqId: quotation.rfqId,
      type: "STATUS_CHANGED",
      staffUserId: staffUser.id,
      metadata: { from: rfq.status, to: "WON", reason: "quotation_accepted" },
    });

    return accepted;
  });
}

/**
 * `nextRfqStatus`, if given, must be an explicit staff choice (Phase 3
 * §25) — rejection alone never silently moves the RFQ to LOST, since a
 * revision may still be coming.
 */
async function rejectQuotation(id, staffUser, { nextRfqStatus } = {}) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  if (!["SENT", "VIEWED"].includes(quotation.status)) {
    throw ApiError.badRequest("Only a sent quotation can be rejected.");
  }
  if (nextRfqStatus && !["NEGOTIATING", "LOST"].includes(nextRfqStatus)) {
    throw ApiError.badRequest("RFQ status after rejection must be NEGOTIATING or LOST.");
  }

  return prisma.$transaction(async (tx) => {
    const rejected = await tx.quotation.update({
      where: { id },
      data: { status: "REJECTED", respondedAt: new Date() },
      include: LINES_INCLUDE,
    });

    await recordStaffActivity(tx, {
      rfqId: quotation.rfqId,
      type: "QUOTATION_REJECTED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version },
    });

    if (nextRfqStatus) {
      const rfq = await tx.rFQ.findUnique({ where: { id: quotation.rfqId } });
      await tx.rFQ.update({ where: { id: quotation.rfqId }, data: { status: nextRfqStatus } });
      await recordStaffActivity(tx, {
        rfqId: quotation.rfqId,
        type: "STATUS_CHANGED",
        staffUserId: staffUser.id,
        metadata: { from: rfq.status, to: nextRfqStatus, reason: "quotation_rejected" },
      });
    }

    return rejected;
  });
}

module.exports = {
  listQuotationsForRfq,
  getQuotation,
  createQuotation,
  updateQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  regenerateAccessToken,
  revokeAccessToken,
};
