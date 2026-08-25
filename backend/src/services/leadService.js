/**
 * Lead creation — the "intent signal, no concrete requirement yet" tier
 * (Phase 2 §5). Idempotent on submissionId: a retried submit (double
 * click, flaky network, React double-invoke) returns the original Lead
 * instead of creating a duplicate — checked both up front (fast path) and
 * by catching the unique-constraint violation (race-safe path), since two
 * near-simultaneous retries can both pass the up-front check.
 */
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { normalizePhone } = require("./phone");
const { resolveContact } = require("./contact");
const { generateLeadReference } = require("./referenceNumber");

const UNIQUE_CONSTRAINT = "P2002";

function serializeLead(lead) {
  return {
    id: lead.id,
    reference: lead.reference,
    status: lead.status,
    createdAt: lead.createdAt,
  };
}

async function createLead(payload) {
  const existing = await prisma.lead.findUnique({ where: { submissionId: payload.submissionId } });
  if (existing) return serializeLead(existing);

  const phone = normalizePhone(payload.contact.phone);
  if (!phone) throw ApiError.badRequest("Please enter a valid phone number.");

  try {
    const lead = await prisma.$transaction(async (tx) => {
      const contact = await resolveContact(tx, {
        name: payload.contact.name,
        phone,
        phoneRaw: payload.contact.phone,
        email: payload.contact.email || null,
        companyName: payload.contact.companyName || null,
      });

      const reference = await generateLeadReference();

      return tx.lead.create({
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
          message: payload.message,
          submissionId: payload.submissionId,
        },
      });
    });

    return serializeLead(lead);
  } catch (err) {
    if (err.code === UNIQUE_CONSTRAINT && err.meta?.target?.includes("submission_id")) {
      const raced = await prisma.lead.findUnique({ where: { submissionId: payload.submissionId } });
      if (raced) return serializeLead(raced);
    }
    throw err;
  }
}

module.exports = { createLead };
