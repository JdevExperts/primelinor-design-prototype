/**
 * RFQ creation — the "concrete, priceable request" tier (Phase 2 §7). Same
 * idempotency contract as Lead creation (see leadService.js). Every item is
 * resolved and price-estimated server-side inside one transaction so a
 * submission that fails partway (e.g. one bad artworkAssetId) never creates
 * a partial RFQ. Catalogue mismatches (unknown product/colour/size, sub-MOQ
 * quantity) are NOT failures — see resolveRfqItem: the request always goes
 * through and sales confirms the spec.
 */
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { normalizePhone } = require("./phone");
const { resolveContact } = require("./contact");
const { generateRfqReference } = require("./referenceNumber");
const { resolveRfqItem } = require("./rfqItem");
const { recordActivity } = require("./rfqActivity");
const { seedWorkingItemsFromRfqItems } = require("./rfqWorkingItems");

const UNIQUE_CONSTRAINT = "P2002";

function serializeRfq(rfq) {
  return {
    id: rfq.id,
    reference: rfq.reference,
    status: rfq.status,
    itemCount: rfq.items?.length ?? undefined,
    createdAt: rfq.createdAt,
  };
}

async function createRfq(payload) {
  const existing = await prisma.rFQ.findUnique({
    where: { submissionId: payload.submissionId },
    include: { items: true },
  });
  if (existing) return serializeRfq(existing);

  const phone = normalizePhone(payload.contact.phone);
  if (!phone) throw ApiError.badRequest("Please enter a valid phone number.");

  try {
    const rfq = await prisma.$transaction(async (tx) => {
      const contact = await resolveContact(tx, {
        name: payload.contact.name,
        phone,
        phoneRaw: payload.contact.phone,
        email: payload.contact.email || null,
        companyName: payload.contact.companyName || null,
      });

      const reference = await generateRfqReference();

      const created = await tx.rFQ.create({
        data: {
          reference,
          contactId: contact.id,
          sourceType: payload.sourceType,
          sourcePath: payload.sourcePath,
          sourceContext: payload.sourceContext || null,
          utmSource: payload.utm?.source || null,
          utmMedium: payload.utm?.medium || null,
          utmCampaign: payload.utm?.campaign || null,
          utmContent: payload.utm?.content || null,
          message: payload.message || null,
          deliveryCity: payload.deliveryCity || null,
          deliveryPin: payload.deliveryPin || null,
          requirementData: payload.requirementData || null,
          submissionId: payload.submissionId,
        },
      });

      for (let i = 0; i < payload.items.length; i += 1) {
        await resolveRfqItem(tx, created.id, payload.items[i], i);
      }

      // Seed the editable working requirement from the submission, once
      // (Phase C). RFQItem[] stays the immutable original.
      await seedWorkingItemsFromRfqItems(tx, created.id);

      await recordActivity(tx, { rfqId: created.id, type: "RFQ_CREATED", actorType: "CUSTOMER" });

      return tx.rFQ.findUnique({ where: { id: created.id }, include: { items: true } });
    });

    return serializeRfq(rfq);
  } catch (err) {
    if (err.code === UNIQUE_CONSTRAINT && err.meta?.target?.includes("submission_id")) {
      const raced = await prisma.rFQ.findUnique({
        where: { submissionId: payload.submissionId },
        include: { items: true },
      });
      if (raced) return serializeRfq(raced);
    }
    throw err;
  }
}

module.exports = { createRfq };
