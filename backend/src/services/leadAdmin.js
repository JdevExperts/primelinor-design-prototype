const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { generateRfqReference } = require("./referenceNumber");
const { resolveRfqItem } = require("./rfqItem");
const { recordActivity } = require("./rfqActivity");

const LEAD_INCLUDE = { contact: { include: { company: true } } };

function buildLeadWhere({ status, source, dateFrom, dateTo, search }) {
  const where = {};
  if (status) where.status = status;
  if (source) where.sourceType = source;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: "insensitive" } },
      { contact: { name: { contains: search, mode: "insensitive" } } },
      { contact: { phone: { contains: search, mode: "insensitive" } } },
      { contact: { email: { contains: search, mode: "insensitive" } } },
      { contact: { company: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }
  return where;
}

async function listLeads({ status, source, dateFrom, dateTo, search, page, limit }) {
  const where = buildLeadWhere({ status, source, dateFrom, dateTo, search });
  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: LEAD_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { leads, total };
}

async function getLead(id) {
  const lead = await prisma.lead.findUnique({ where: { id }, include: LEAD_INCLUDE });
  if (!lead) throw ApiError.notFound("Lead not found");
  return lead;
}

async function updateLead(id, { status }) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw ApiError.notFound("Lead not found");
  if (lead.status === "CONVERTED") {
    throw ApiError.badRequest("A converted lead's status can't be changed directly — see the linked RFQ.");
  }

  return prisma.lead.update({
    where: { id },
    data: { status },
    include: LEAD_INCLUDE,
  });
}

/**
 * Lead -> RFQ conversion (Phase 3 §9). Reuses resolveRfqItem — the exact
 * same item-resolution/snapshot/pricing logic the public POST /rfqs
 * endpoint uses — so an admin-created item is priced and validated
 * identically to a customer-submitted one. Items are optional: staff can
 * convert bare and add items to the RFQ afterward (§40).
 */
async function convertLeadToRfq(leadId, staffUser, payload) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw ApiError.notFound("Lead not found");
  if (lead.status === "CONVERTED") {
    throw ApiError.badRequest("This lead has already been converted.");
  }

  const rfq = await prisma.$transaction(async (tx) => {
    const reference = await generateRfqReference();

    const created = await tx.rFQ.create({
      data: {
        reference,
        contactId: lead.contactId,
        leadId: lead.id,
        sourceType: lead.sourceType,
        sourcePath: lead.sourcePath,
        sourceContext: lead.sourceContext,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
        utmContent: lead.utmContent,
        message: payload.message?.trim() || lead.message,
        deliveryCity: payload.deliveryCity || null,
        deliveryPin: payload.deliveryPin || null,
        requirementData: payload.requirementData || null,
        // Not customer-idempotency-sensitive — re-conversion is blocked by
        // lead.status above, so a fresh id per call is fine.
        submissionId: `admin-convert-${lead.id}`,
      },
    });

    const items = payload.items || [];
    for (let i = 0; i < items.length; i += 1) {
      await resolveRfqItem(tx, created.id, items[i], i);
    }

    await tx.lead.update({
      where: { id: lead.id },
      data: { status: "CONVERTED", convertedRfqId: created.id },
    });

    await recordActivity(tx, {
      rfqId: created.id,
      type: "RFQ_CREATED",
      actorType: "STAFF",
      actorId: staffUser.id,
      metadata: { convertedFromLeadId: lead.id },
    });

    return created;
  });

  return rfq;
}

module.exports = { listLeads, getLead, updateLead, convertLeadToRfq };
