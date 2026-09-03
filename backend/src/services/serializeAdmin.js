/**
 * Serializers for the internal admin API. Distinct from src/services/
 * serialize.js (public catalog shapes) — these carry contact PII, internal
 * notes, and signed artwork URLs that must never reach a public endpoint.
 */
const storage = require("./storage");
const { safeDownloadFilename } = require("../utils/artworkHeaders");
const { lineNeedsRate } = require("./quotationTotals");
const { quotationSendBlockers } = require("./quotationService");
const { quotationReference } = require("./quoteReference");
const { canCreateRevision, canEditInPlace, canCancel, isExpired, revisionCta } = require("./quotationEligibility");
const { hasPendingRevisionRequest, newerDraftVersion } = require("./quotationRevisionRules");

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
    productCodeSnapshot: item.productCodeSnapshot,
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

function serializeQuotationParty(quotation) {
  return {
    name: quotation.partyName || null,
    contactPerson: quotation.partyContactPerson || null,
    phone: quotation.partyPhone || null,
    email: quotation.partyEmail || null,
    gstin: quotation.partyGstin || null,
    address: quotation.partyAddress || null,
  };
}

function serializeQuotationSummary(quotation) {
  const lines = quotation.lines || [];
  return {
    id: quotation.id,
    version: quotation.version,
    reference: quotationReference(quotation.rfq, quotation),
    originType: quotation.originType,
    originDetail: quotation.originDetail || null,
    isExpired: isExpired(quotation),
    isCancelled: quotation.status === "CANCELLED",
    cancelledAt: quotation.cancelledAt || null,
    rfqId: quotation.rfqId || null,
    rfqReference: quotation.rfq?.reference || null,
    groupReference: quotation.groupReference || null,
    quotationGroupId: quotation.quotationGroupId,
    // Thread grouping (Quotation Tracking UX): in the top-level list this
    // row IS the latest version of its thread, and versionCount is how
    // many versions the thread has. Set by listQuotations.
    latestVersion: quotation.version,
    versionCount: quotation._versionCount || 1,
    party: serializeQuotationParty(quotation),
    status: quotation.status,
    grandTotal: quotation.grandTotal != null ? Number(quotation.grandTotal) : null,
    currency: quotation.currency,
    validUntil: quotation.validUntil,
    lineCount: lines.length,
    linesNeedingRate: lines.filter((l) =>
      lineNeedsRate({
        lineType: l.lineType,
        quantity: l.quantity,
        unitPrice: l.unitPrice != null ? Number(l.unitPrice) : null,
        lineTotal: l.lineTotal != null ? Number(l.lineTotal) : null,
      }),
    ).length,
    createdBy: serializeStaffRef(quotation.createdBy),
    createdAt: quotation.createdAt,
    updatedAt: quotation.updatedAt,
    // Set by listQuotations — the customer's latest response is a revision request.
    pendingRevision: Boolean(quotation._pendingRevision),
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
    productId: line.productId || null,
    productNameSnapshot: line.productNameSnapshot || null,
    productCodeSnapshot: line.productCodeSnapshot || null,
    quantity: line.quantity,
    unit: line.unit,
    unitPrice: line.unitPrice != null ? Number(line.unitPrice) : null,
    // null (not 0) when the line still needs a rate — the UI shows
    // "Rate required" rather than a misleading ₹0 (§11).
    lineTotal: line.lineTotal != null ? Number(line.lineTotal) : null,
    needsRate: lineNeedsRate({
      lineType: line.lineType,
      quantity: line.quantity,
      unitPrice: line.unitPrice != null ? Number(line.unitPrice) : null,
      lineTotal: line.lineTotal != null ? Number(line.lineTotal) : null,
    }),
    sortOrder: line.sortOrder,
    metadata: line.metadata,
  };
}

/**
 * One row in the Version History table. Lightweight — no line detail, but
 * enough to render Version / Quotation ID / Status / Grand Total / Created
 * / Valid Until / Created By / Action. `rfq` (the parent quotation's RFQ,
 * if any) is passed so the per-version reference resolves for RFQ-origin.
 */
function serializeQuotationVersionRow(version, rfq = null) {
  const lines = version.lines || [];
  const needingRate = lines.filter((l) =>
    lineNeedsRate({
      lineType: l.lineType,
      quantity: l.quantity,
      unitPrice: l.unitPrice != null ? Number(l.unitPrice) : null,
      lineTotal: l.lineTotal != null ? Number(l.lineTotal) : null,
    }),
  ).length;
  return {
    id: version.id,
    version: version.version,
    reference: quotationReference(rfq || version.rfq || null, version),
    status: version.status,
    grandTotal: version.grandTotal != null ? Number(version.grandTotal) : null,
    validUntil: version.validUntil,
    isExpired: isExpired(version),
    isCancelled: version.status === "CANCELLED",
    linesNeedingRate: needingRate,
    pricingComplete: needingRate === 0,
    createdAt: version.createdAt,
    updatedAt: version.updatedAt,
    createdBy: serializeStaffRef(version.createdBy),
    hasActiveLink: Boolean(version.accessTokenHash) && !version.accessTokenRevokedAt,
  };
}

function serializeInternalNote(note) {
  return {
    id: note.id,
    body: note.body,
    author: serializeStaffRef(note.author),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt || note.createdAt,
    editable: true,
  };
}

function serializeQuotationDetail(quotation) {
  const lines = (quotation.lines || []).map(serializeQuotationLine);
  const linesNeedingRate = lines.filter((l) => l.needsRate).length;
  const versions = (quotation.versions || []).map((v) => serializeQuotationVersionRow(v, quotation.rfq));
  const newerDraft = newerDraftVersion(versions, quotation.version);
  const latestVersion = versions.length ? Math.max(...versions.map((v) => v.version)) : quotation.version;
  const pendingRevision = hasPendingRevisionRequest(quotation.activity || []);
  return {
    ...serializeQuotationSummary(quotation),
    subtotal: Number(quotation.subtotal),
    taxMode: quotation.taxMode,
    taxAmount: quotation.taxAmount != null ? Number(quotation.taxAmount) : null,
    validUntil: quotation.validUntil,
    customerNotes: quotation.customerNotes,
    viewedAt: quotation.viewedAt,
    respondedAt: quotation.respondedAt,
    cancelledAt: quotation.cancelledAt || null,
    cancelReason: quotation.cancelReason || null,
    updatedAt: quotation.updatedAt,
    lines,
    // Commercial readiness — drives "Pricing incomplete" and the Send gate.
    pricingComplete: linesNeedingRate === 0,
    linesNeedingRate,
    sendBlockers: quotation.status === "DRAFT" ? quotationSendBlockers(quotation) : [],
    // Version-eligibility — single source of truth (quotationEligibility.js).
    canEditInPlace: canEditInPlace(quotation.status),
    canCreateRevision: canCreateRevision(quotation.status),
    canCancel: canCancel(quotation.status),
    revisionCta: revisionCta(quotation.status),
    // Every version in the lineage, ascending, for the Version History
    // table, plus the highest version number in the thread so the editor
    // can flag "you're viewing an older version — newer version exists".
    versions,
    latestVersion,
    newerDraft: newerDraft ? { id: newerDraft.id, version: newerDraft.version } : null,
    // Private negotiation notes for the lineage (§8/§9). Never public.
    internalNotes: (quotation.internalNotes || []).map(serializeInternalNote),
    // Customer responses on this version — revision request + its message,
    // accept, decline, first view. Newest first.
    customerActivity: (quotation.activity || []).map((a) => ({
      id: a.id,
      type: a.type,
      actorType: a.actorType,
      message: a.metadata?.message || null,
      createdAt: a.createdAt,
    })),
    hasPendingRevisionRequest: pendingRevision,
    pendingRevision,
  };
}

function serializeWorkingItem(item) {
  return {
    id: item.id,
    productId: item.productId || null,
    productCode: item.productCodeSnapshot || null,
    productName: item.productNameSnapshot || null,
    description: item.description || null,
    quantity: item.quantity,
    unit: item.unit || null,
    spec: item.specSnapshot || null,
    color: item.colorNameSnapshot || null,
    variant: item.variantLabelSnapshot || null,
    sortOrder: item.sortOrder,
    isCustom: !item.productId,
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
    // The immutable customer submission.
    items,
    originalItems: items,
    // The editable sales requirement (Phase C).
    workingItems: (rfq.workingItems || []).map(serializeWorkingItem),
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
  serializeWorkingItem,
  serializeQuotationSummary,
  serializeQuotationDetail,
  serializeQuotationParty,
  serializeQuotationVersionRow,
  serializeInternalNote,
  serializeNote,
  serializeActivity,
  serializeStaffRef,
};
