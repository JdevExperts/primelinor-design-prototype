/**
 * Serializers for the internal admin API. Distinct from src/services/
 * serialize.js (public catalog shapes) — these carry contact PII, internal
 * notes, and signed artwork URLs that must never reach a public endpoint.
 */
const storage = require("./storage");
const { safeDownloadFilename } = require("../utils/artworkHeaders");

function serializeCompany(company) {
  if (!company) return null;
  return { id: company.id, name: company.name, domain: company.domain };
}

function serializeContact(contact) {
  if (!contact) return null;
  return {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    phoneRaw: contact.phoneRaw,
    email: contact.email,
    companyNameRaw: contact.companyNameRaw,
    company: serializeCompany(contact.company),
  };
}

function serializeStaffRef(staffUser) {
  if (!staffUser) return null;
  return { id: staffUser.id, name: staffUser.name, email: staffUser.email };
}

function serializeUtm(row) {
  return { source: row.utmSource, medium: row.utmMedium, campaign: row.utmCampaign, content: row.utmContent };
}

function serializeLeadSummary(lead) {
  return {
    id: lead.id,
    reference: lead.reference,
    status: lead.status,
    sourceType: lead.sourceType,
    contactName: lead.contact.name,
    contactPhone: lead.contact.phone,
    companyName: lead.contact.company?.name || lead.contact.companyNameRaw || null,
    createdAt: lead.createdAt,
  };
}

function serializeLeadDetail(lead) {
  return {
    id: lead.id,
    reference: lead.reference,
    status: lead.status,
    sourceType: lead.sourceType,
    sourcePath: lead.sourcePath,
    sourceContext: lead.sourceContext,
    utm: serializeUtm(lead),
    message: lead.message,
    contact: serializeContact(lead.contact),
    convertedRfqId: lead.convertedRfqId,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

function serializeRfqSummary(rfq) {
  return {
    id: rfq.id,
    reference: rfq.reference,
    status: rfq.status,
    sourceType: rfq.sourceType,
    contactName: rfq.contact.name,
    contactPhone: rfq.contact.phone,
    companyName: rfq.contact.company?.name || rfq.contact.companyNameRaw || null,
    itemCount: rfq._count?.items ?? rfq.items?.length ?? undefined,
    estimatedTotal: rfq.items?.reduce((sum, item) => sum + Number(item.estimatedTotal || 0), 0),
    assignedTo: serializeStaffRef(rfq.assignedTo),
    createdAt: rfq.createdAt,
  };
}

async function serializeRfqItemWithArtwork(item) {
  const artworks = await Promise.all(
    (item.artworks || []).map(async (asset) => ({
      id: asset.id,
      originalFileName: asset.originalFileName,
      mimeType: asset.mimeType,
      size: asset.size,
      downloadUrl: await storage.getSignedReadUrl(asset.storageKey, {
        expiresInSeconds: 900,
        filename: safeDownloadFilename(asset.originalFileName),
      }),
    })),
  );

  return {
    id: item.id,
    productId: item.productId,
    description: item.description,
    productNameSnapshot: item.productNameSnapshot,
    productSlugSnapshot: item.productSlugSnapshot,
    specSnapshot: item.specSnapshot,
    colorId: item.colorId,
    colorNameSnapshot: item.colorNameSnapshot,
    variantId: item.variantId,
    variantLabelSnapshot: item.variantLabelSnapshot,
    unitSnapshot: item.unitSnapshot,
    pricingModeSnapshot: item.pricingModeSnapshot,
    quantity: item.quantity,
    // Labeled explicitly — never presented as a final quote (Phase 3 §34).
    estimate: {
      label: "Website Estimate",
      unitPrice: item.estimatedUnitPrice != null ? Number(item.estimatedUnitPrice) : null,
      total: item.estimatedTotal != null ? Number(item.estimatedTotal) : null,
    },
    customizationData: item.customizationData,
    artwork: artworks,
  };
}

function serializeActivity(activity) {
  return {
    id: activity.id,
    type: activity.type,
    actorType: activity.actorType,
    actorId: activity.actorId,
    metadata: activity.metadata,
    createdAt: activity.createdAt,
  };
}

function serializeNote(note) {
  return {
    id: note.id,
    body: note.body,
    author: serializeStaffRef(note.author),
    createdAt: note.createdAt,
  };
}

function serializeQuotationSummary(quotation) {
  return {
    id: quotation.id,
    version: quotation.version,
    status: quotation.status,
    grandTotal: Number(quotation.grandTotal),
    currency: quotation.currency,
    createdBy: serializeStaffRef(quotation.createdBy),
    createdAt: quotation.createdAt,
    sentAt: quotation.sentAt,
    supersedesId: quotation.supersedesId,
    // Whether a customer link currently exists — the raw token itself is
    // never retrievable again after the moment it was generated (Phase 4
    // §3), so this just tells the admin UI whether "Copy Link" is
    // possible right now or a regenerate is needed first.
    hasActiveLink: Boolean(quotation.accessTokenHash) && !quotation.accessTokenRevokedAt,
  };
}

function serializeQuotationLine(line) {
  return {
    id: line.id,
    rfqItemId: line.rfqItemId,
    lineType: line.lineType,
    description: line.description,
    quantity: line.quantity,
    unit: line.unit,
    unitPrice: line.unitPrice != null ? Number(line.unitPrice) : null,
    lineTotal: Number(line.lineTotal),
    sortOrder: line.sortOrder,
    metadata: line.metadata,
  };
}

function serializeQuotationDetail(quotation) {
  return {
    ...serializeQuotationSummary(quotation),
    rfqId: quotation.rfqId,
    subtotal: Number(quotation.subtotal),
    taxMode: quotation.taxMode,
    taxAmount: quotation.taxAmount != null ? Number(quotation.taxAmount) : null,
    validUntil: quotation.validUntil,
    customerNotes: quotation.customerNotes,
    viewedAt: quotation.viewedAt,
    respondedAt: quotation.respondedAt,
    updatedAt: quotation.updatedAt,
    lines: (quotation.lines || []).map(serializeQuotationLine),
  };
}

async function serializeRfqDetail(rfq) {
  const items = await Promise.all((rfq.items || []).map(serializeRfqItemWithArtwork));

  return {
    id: rfq.id,
    reference: rfq.reference,
    status: rfq.status,
    sourceType: rfq.sourceType,
    sourcePath: rfq.sourcePath,
    sourceContext: rfq.sourceContext,
    utm: serializeUtm(rfq),
    message: rfq.message,
    deliveryCity: rfq.deliveryCity,
    deliveryPin: rfq.deliveryPin,
    currency: rfq.currency,
    requirementData: rfq.requirementData,
    contact: serializeContact(rfq.contact),
    leadId: rfq.leadId,
    assignedTo: serializeStaffRef(rfq.assignedTo),
    items,
    activity: (rfq.activity || []).map(serializeActivity),
    notes: (rfq.notes || []).map(serializeNote),
    quotations: (rfq.quotations || []).map(serializeQuotationSummary),
    createdAt: rfq.createdAt,
    updatedAt: rfq.updatedAt,
  };
}

module.exports = {
  serializeLeadSummary,
  serializeLeadDetail,
  serializeRfqSummary,
  serializeRfqDetail,
  serializeQuotationSummary,
  serializeQuotationDetail,
  serializeNote,
  serializeActivity,
  serializeStaffRef,
};
