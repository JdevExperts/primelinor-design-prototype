const crypto = require("node:crypto");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { computeQuotationTotals } = require("./quotationTotals");
const { computeEstimateForQuantity } = require("./pricingEstimate");
const { recordStaffActivity } = require("./rfqActivity");
const { generateToken } = require("./quoteToken");
const { resolveValidUntil } = require("./quotationValidity");
const { generateQuotationGroupReference } = require("./referenceNumber");
const { ensureWorkingItems } = require("./rfqWorkingItems");
const { isUniqueConstraintOn } = require("../utils/prismaErrors");
const { canCreateRevision, canEditInPlace, canCancel } = require("./quotationEligibility");
const { newerDraftVersion, hasPendingRevisionRequest } = require("./quotationRevisionRules");
const { bareGroupReference } = require("./quotationThread");
const { periodRange } = require("./dashboardPeriods");

const LINES_INCLUDE = { lines: { orderBy: { sortOrder: "asc" } }, createdBy: true };
// Detail/list also needs the RFQ reference (RFQ-origin) for display.
const DETAIL_INCLUDE = { ...LINES_INCLUDE, rfq: { select: { id: true, reference: true } } };

async function listQuotationsForRfq(rfqId) {
  return prisma.quotation.findMany({
    where: { rfqId },
    include: DETAIL_INCLUDE,
    orderBy: { version: "desc" },
  });
}

// Customer-response events for this specific quotation version — what
// Admin/Sales need to see (a revision request and its message, accept,
// decline, first view). Covers both MANUAL (quotationId-scoped) and
// RFQ-origin (rfqId-scoped, quotationId in metadata) activity rows.
const QUOTATION_EVENT_TYPES = [
  "QUOTATION_VIEWED",
  "CUSTOMER_REVISION_REQUESTED",
  "REVISION_REQUEST_ADDRESSED",
  "QUOTATION_ACCEPTED",
  "QUOTATION_REJECTED",
  "QUOTATION_REVISION_CREATED",
  "QUOTATION_CANCELLED",
  "QUOTE_LINK_REGENERATED",
  "QUOTE_LINK_REVOKED",
];

async function loadQuotationActivity(id) {
  return prisma.rFQActivity.findMany({
    where: {
      type: { in: QUOTATION_EVENT_TYPES },
      OR: [{ quotationId: id }, { metadata: { path: ["quotationId"], equals: id } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getQuotation(id) {
  const quotation = await prisma.quotation.findUnique({ where: { id }, include: DETAIL_INCLUDE });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  quotation.activity = await loadQuotationActivity(id);
  // Every version in the same lineage — for the Version History panel and
  // the "a newer draft already exists" hint (§18/§19).
  quotation.versions = await prisma.quotation.findMany({
    where: { quotationGroupId: quotation.quotationGroupId },
    include: LINES_INCLUDE,
    orderBy: { version: "asc" },
  });
  // Private negotiation notes for this lineage (§8/§9) — scoped to the
  // group's versions so V1's notes stay visible while working on V2.
  // Never public, never in the PDF. RFQ-scoped notes stay on the RFQ page.
  quotation.internalNotes = await prisma.internalNote.findMany({
    where: { quotationId: { in: quotation.versions.map((v) => v.id) } },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
  return quotation;
}

/**
 * Top-level quotations list (Phase E §36; thread-grouped per the Quotation
 * Tracking UX brief). ONE row per quotationGroupId — the latest version
 * (highest version number, §2). Filters status/origin/createdBy/date/
 * expired against that latest version (§5). Search matches ANY version of
 * a thread and returns the thread's latest row (§4). `versionCount` is the
 * number of versions in the thread.
 */
/** ids whose latest customer/workflow event is an unresolved revision request. */
async function computePendingRevisionSet(ids) {
  const set = new Set();
  if (!ids.length) return set;
  const events = await prisma.rFQActivity.findMany({
    where: {
      type: {
        in: [
          "CUSTOMER_REVISION_REQUESTED",
          "REVISION_REQUEST_ADDRESSED",
          "QUOTATION_REVISION_CREATED",
          "QUOTATION_ACCEPTED",
          "QUOTATION_REJECTED",
          "QUOTATION_CANCELLED",
        ],
      },
      OR: [
        { quotationId: { in: ids } },
        { AND: [{ quotationId: null }, { metadata: { path: ["quotationId"], not: null } }] },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { type: true, quotationId: true, metadata: true },
  });
  const seen = new Set();
  for (const e of events) {
    const qid = e.quotationId || e.metadata?.quotationId;
    if (!qid || !ids.includes(qid) || seen.has(qid)) continue;
    seen.add(qid);
    if (e.type === "CUSTOMER_REVISION_REQUESTED") set.add(qid);
  }
  return set;
}

async function listQuotations(query) {
  const {
    status,
    origin,
    createdBy,
    dateFrom,
    dateTo,
    period,
    search,
    expired,
    pendingRevision,
    thread,
    page = 1,
    limit = 20,
  } = query;

  // Filters that must be evaluated against the thread's LATEST version.
  const latestWhere = {};
  if (origin) latestWhere.originType = origin;
  if (createdBy) latestWhere.createdByUserId = createdBy;

  // Period is a THREAD-level filter (§9): a thread is kept when its FIRST
  // version was created in the window — so a V2/V3 never drags an old
  // quotation into a later date window. Explicit dateFrom/dateTo win.
  let threadCreatedRange = null;
  if (dateFrom || dateTo) {
    threadCreatedRange = {};
    if (dateFrom) threadCreatedRange.gte = new Date(dateFrom).getTime();
    if (dateTo) threadCreatedRange.lte = new Date(dateTo).getTime();
  } else {
    const r = periodRange(period || "30d");
    if (r) threadCreatedRange = { gte: r.gte.getTime(), lte: r.lt.getTime() };
  }

  const nowTs = Date.now();
  if (expired) {
    // Computed, never a stored status (§13): a live offer past its date.
    latestWhere.status = { in: ["SENT", "VIEWED"] };
    latestWhere.validUntil = { lt: new Date() };
  } else if (thread === "active") {
    // Operational open pipeline — thread's latest version is DRAFT/SENT/
    // VIEWED (expiry is filtered out below in JS).
    latestWhere.status = { in: ["DRAFT", "SENT", "VIEWED"] };
  } else if (status) {
    latestWhere.status = status;
  }

  // Search hits any version; an old version's "-V<n>" suffix is stripped
  // so the stored group reference still matches (§4).
  let groupIdFilter = null;
  if (search) {
    const s = search.trim();
    const bare = bareGroupReference(s);
    const matches = await prisma.quotation.findMany({
      where: {
        OR: [
          { groupReference: { contains: bare, mode: "insensitive" } },
          { partyName: { contains: s, mode: "insensitive" } },
          { partyPhone: { contains: s, mode: "insensitive" } },
          { rfq: { reference: { contains: bare, mode: "insensitive" } } },
          { lines: { some: { productCodeSnapshot: { contains: s, mode: "insensitive" } } } },
        ],
      },
      select: { quotationGroupId: true },
      distinct: ["quotationGroupId"],
    });
    groupIdFilter = matches.map((m) => m.quotationGroupId);
    if (groupIdFilter.length === 0) return { quotations: [], total: 0, page, limit };
  }

  // Latest version number + total version count + thread-creation
  // (earliest version's createdAt) per thread.
  let groups = await prisma.quotation.groupBy({
    by: ["quotationGroupId"],
    where: groupIdFilter ? { quotationGroupId: { in: groupIdFilter } } : {},
    _max: { version: true },
    _min: { createdAt: true },
    _count: { _all: true },
  });
  if (threadCreatedRange) {
    groups = groups.filter((g) => {
      const t = g._min.createdAt ? new Date(g._min.createdAt).getTime() : 0;
      if (threadCreatedRange.gte != null && t < threadCreatedRange.gte) return false;
      if (threadCreatedRange.lte != null && t > threadCreatedRange.lte) return false;
      return true;
    });
  }
  const versionCountByGroup = new Map(groups.map((g) => [g.quotationGroupId, g._count._all]));

  // Each thread's latest row = (groupId, its max version). Filters above
  // are AND-ed so a thread whose latest version doesn't match drops out.
  const rowWhere = {
    AND: [
      { OR: groups.map((g) => ({ quotationGroupId: g.quotationGroupId, version: g._max.version })) },
      latestWhere,
    ],
  };

  // Full candidate set of latest rows (small — one per thread). The
  // pendingRevision / active-thread filters need per-row info that can't
  // live in the SQL WHERE, so they run here before pagination.
  let candidates = await prisma.quotation.findMany({
    where: rowWhere,
    select: { id: true, quotationGroupId: true, status: true, validUntil: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  const pendingSet = await computePendingRevisionSet(candidates.map((c) => c.id));

  if (thread === "active") {
    candidates = candidates.filter(
      (c) =>
        !(["SENT", "VIEWED"].includes(c.status) && c.validUntil && new Date(c.validUntil).getTime() < nowTs),
    );
  }
  if (pendingRevision) {
    candidates = candidates.filter((c) => pendingSet.has(c.id));
  }

  const total = candidates.length;
  const pageIds = candidates.slice((page - 1) * limit, (page - 1) * limit + limit).map((c) => c.id);

  const pageRows = pageIds.length
    ? await prisma.quotation.findMany({ where: { id: { in: pageIds } }, include: DETAIL_INCLUDE })
    : [];
  const byId = new Map(pageRows.map((q) => [q.id, q]));
  const quotations = pageIds.map((id) => byId.get(id)).filter(Boolean);

  for (const q of quotations) {
    q._versionCount = versionCountByGroup.get(q.quotationGroupId) || 1;
    q._pendingRevision = pendingSet.has(q.id);
  }

  return { quotations, total, page, limit };
}

function assertEditable(quotation) {
  if (quotation.status !== "DRAFT") {
    throw ApiError.badRequest(`A ${quotation.status.toLowerCase()} quotation can't be edited — only DRAFT.`);
  }
}

async function writeLines(tx, quotationId, lines) {
  await tx.quotationLine.deleteMany({ where: { quotationId } });
  if (!lines.length) return;

  // Freeze each PRODUCT line's identity (productId + name + code). Values
  // supplied on the line itself win (auto-populated / clone paths already
  // carry them); otherwise they fall back to the linked RFQItem's own
  // immutable snapshot (§16/§18). Never re-read from live catalogue data.
  const rfqItemIds = [...new Set(lines.map((line) => line.rfqItemId).filter(Boolean))];
  const byRfqItemId = new Map();
  if (rfqItemIds.length) {
    const rows = await tx.rFQItem.findMany({
      where: { id: { in: rfqItemIds } },
      select: { id: true, productId: true, productNameSnapshot: true, productCodeSnapshot: true },
    });
    for (const row of rows) byRfqItemId.set(row.id, row);
  }

  await tx.quotationLine.createMany({
    data: lines.map((line) => {
      const fromItem = line.rfqItemId ? byRfqItemId.get(line.rfqItemId) : null;
      return {
        quotationId,
        rfqItemId: line.rfqItemId || null,
        lineType: line.lineType,
        description: line.description,
        productId: line.lineType === "PRODUCT" ? line.productId ?? fromItem?.productId ?? null : null,
        productNameSnapshot:
          line.lineType === "PRODUCT" ? line.productNameSnapshot ?? fromItem?.productNameSnapshot ?? null : null,
        productCodeSnapshot:
          line.lineType === "PRODUCT" ? line.productCode ?? fromItem?.productCodeSnapshot ?? null : null,
        quantity: line.quantity ?? null,
        unit: line.unit || null,
        unitPrice: line.unitPrice ?? null,
        lineTotal: line.lineTotal,
        sortOrder: line.sortOrder,
        metadata: line.metadata || null,
      };
    }),
  });
}

/** A finite, non-negative number, or null. Website estimates that are null/0/NaN become "rate required". */
function usableRate(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Snapshot the RFQ's items into quotation-line input (§9). Every item is
 * carried over — including QUOTE_ONLY / no-estimate ones, which get a null
 * rate ("rate required") rather than a misleading ₹0 (§10/§11).
 */
function buildLinesFromRfqItems(items) {
  return (items || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({
      rfqItemId: item.id,
      lineType: "PRODUCT",
      description: item.productNameSnapshot || item.description || "Item",
      productId: item.productId || undefined,
      productNameSnapshot: item.productNameSnapshot || undefined,
      productCode: item.productCodeSnapshot || undefined,
      quantity: item.quantity ?? 1,
      unit: item.unitSnapshot || "piece",
      unitPrice: usableRate(item.estimatedUnitPrice) ?? undefined,
      sortOrder: index,
    }));
}

/**
 * Snapshot the RFQ's CURRENT WORKING requirement into quotation-line input
 * (Phase C). This — not the immutable RFQItem[] — is the default source
 * for a new quotation from an RFQ.
 *
 * `productById` (id -> product with priceMode/fixedPrice/priceTiers) lets
 * a catalogue line pre-fill its unit rate from the current catalogue price
 * at the line's quantity, as an EDITABLE starting value the salesperson
 * can override. A QUOTE_ONLY product (or an unpriced/custom line) has no
 * rate — it shows "rate required", never a fake ₹0.
 */
function buildLinesFromWorkingItems(workingItems, productById = new Map()) {
  return (workingItems || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => {
      const quantity = item.quantity ?? 1;
      const product = item.productId ? productById.get(item.productId) : null;
      const estimate = product ? computeEstimateForQuantity(product, quantity) : { unitPrice: null };
      return {
        lineType: "PRODUCT",
        description: item.productNameSnapshot || item.description || "Item",
        productId: item.productId || undefined,
        productNameSnapshot: item.productNameSnapshot || undefined,
        productCode: item.productCodeSnapshot || undefined,
        quantity,
        unit: item.unit || "piece",
        unitPrice: usableRate(estimate.unitPrice) ?? undefined,
        sortOrder: index,
      };
    });
}

/** id -> {priceMode, fixedPrice, priceTiers} for every catalogue product referenced by these rows. */
async function loadProductPriceMap(db, rows) {
  const ids = [...new Set((rows || []).map((r) => r.productId).filter(Boolean))];
  if (!ids.length) return new Map();
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, priceMode: true, fixedPrice: true, priceTiers: { select: { minQty: true, maxQty: true, unitPrice: true } } },
  });
  return new Map(products.map((p) => [p.id, p]));
}

/**
 * For quotation-line input that links a catalogue product but carries no
 * rate yet, fill an editable starting rate from the current catalogue
 * price at the line's quantity. A rate the caller already set is kept
 * as-is; QUOTE_ONLY stays unset ("rate required"). Used for MANUAL
 * quotation creation so a picked product behaves the same as an
 * RFQ-sourced one.
 */
async function fillMissingProductRates(db, lines) {
  const needsRate = (lines || []).filter(
    (l) => l.lineType === "PRODUCT" && l.productId && l.unitPrice == null && l.lineTotal == null,
  );
  if (!needsRate.length) return lines;
  const priceMap = await loadProductPriceMap(db, needsRate);
  return lines.map((l) => {
    if (l.lineType !== "PRODUCT" || !l.productId || l.unitPrice != null || l.lineTotal != null) return l;
    const product = priceMap.get(l.productId);
    if (!product) return l;
    const rate = usableRate(computeEstimateForQuantity(product, l.quantity ?? 1).unitPrice);
    return rate != null ? { ...l, unitPrice: rate } : l;
  });
}

/** Clone a previous quotation version's lines verbatim for a revision draft (§20). */
function buildLinesFromQuotation(previous) {
  return (previous.lines || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((line, index) => ({
      rfqItemId: line.rfqItemId || undefined,
      lineType: line.lineType,
      description: line.description,
      productId: line.productId || undefined,
      productNameSnapshot: line.productNameSnapshot || undefined,
      productCode: line.productCodeSnapshot || undefined,
      quantity: line.quantity ?? undefined,
      unit: line.unit || undefined,
      unitPrice: line.unitPrice != null ? Number(line.unitPrice) : undefined,
      lineTotal: line.unitPrice == null && line.lineTotal != null ? Number(line.lineTotal) : undefined,
      sortOrder: index,
    }));
}

/** Party snapshot derived from an RFQ's contact/company (AA-2). */
function partyFromRfq(rfq) {
  const c = rfq.contact || {};
  return {
    partyName: c.company?.name || c.companyNameRaw || c.name || null,
    partyContactPerson: c.name || null,
    partyPhone: c.phoneRaw || c.phone || null,
    partyEmail: c.email || null,
    partyGstin: null,
    partyAddress: null,
  };
}

/** Normalize a manual-quotation party input into the six snapshot columns. */
function normalizeParty(party = {}) {
  const clean = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
  return {
    partyName: clean(party.name || party.partyName),
    partyContactPerson: clean(party.contactPerson || party.partyContactPerson),
    partyPhone: clean(party.phone || party.partyPhone),
    partyEmail: clean(party.email || party.partyEmail),
    partyGstin: clean(party.gstin || party.partyGstin),
    partyAddress: clean(party.address || party.partyAddress),
  };
}

/**
 * The one place a quotation-version row is inserted — shared by RFQ-origin
 * and MANUAL creation so there is a single quotation engine (§34). Runs
 * inside its own transaction; the P2002-on-version catch turns a
 * concurrent-revision race into a clean 409.
 */
async function insertQuotationVersion({
  originType,
  originDetail,
  rfqId,
  quotationGroupId,
  groupReference,
  party,
  supersedes,
  version,
  payload,
  staffUser,
  sourceLines,
}) {
  const { lines, subtotal, grandTotal } = computeQuotationTotals(sourceLines || [], payload.taxAmount);
  try {
    return await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          originType,
          originDetail: originDetail ?? supersedes?.originDetail ?? null,
          rfqId: rfqId || null,
          quotationGroupId,
          groupReference: groupReference || null,
          version,
          supersedesId: supersedes?.id || null,
          currency: payload.currency || supersedes?.currency || "INR",
          subtotal,
          taxMode: payload.taxMode ?? supersedes?.taxMode ?? null,
          taxAmount:
            payload.taxAmount ?? (supersedes?.taxAmount != null ? Number(supersedes.taxAmount) : null),
          grandTotal,
          validUntil: resolveValidUntil(payload.validUntil),
          customerNotes: payload.customerNotes ?? supersedes?.customerNotes ?? null,
          createdByUserId: staffUser.id,
          ...party,
        },
      });
      await writeLines(tx, quotation.id, lines);

      await recordStaffActivity(tx, {
        ...(rfqId ? { rfqId } : { quotationId: quotation.id }),
        type: supersedes ? "QUOTATION_REVISION_CREATED" : "QUOTATION_CREATED",
        staffUserId: staffUser.id,
        metadata: {
          quotationId: quotation.id,
          version,
          supersedesId: supersedes?.id || null,
          origin: originType,
          lineCount: lines.length,
          reference: groupReference || null,
        },
      });

      return tx.quotation.findUnique({ where: { id: quotation.id }, include: LINES_INCLUDE });
    });
  } catch (err) {
    if (isUniqueConstraintOn(err, "version")) {
      throw ApiError.conflict("Another quotation version was created at the same time. Refresh and try again.");
    }
    throw err;
  }
}

async function nextVersion(quotationGroupId) {
  const last = await prisma.quotation.aggregate({ where: { quotationGroupId }, _max: { version: true } });
  return (last._max.version || 0) + 1;
}

/** Party snapshot cloned from a prior version — the version's own snapshot
 *  is authoritative once it exists, so a revision never re-derives it from
 *  the RFQ (§6). A caller-supplied `party` still wins (explicit edit). */
function partyFromQuotation(source) {
  return normalizeParty({
    partyName: source.partyName,
    partyContactPerson: source.partyContactPerson,
    partyPhone: source.partyPhone,
    partyEmail: source.partyEmail,
    partyGstin: source.partyGstin,
    partyAddress: source.partyAddress,
  });
}

/**
 * The one unified path for creating the NEXT version of an existing
 * quotation lineage — RFQ-origin or MANUAL alike (§5). Everything needed
 * comes from the source quotation row itself; the RFQ is optional context.
 *
 *  - allowed from any issued status (SENT/VIEWED/ACCEPTED/REJECTED/
 *    SUPERSEDED) — never from DRAFT (edited in place), never from CANCELLED
 *  - clones group id, group reference, origin, party snapshot, currency,
 *    tax fields, customer notes and every line from the source
 *  - fresh 7-day validity unless the caller sets one (§17)
 *  - refuses a second open draft in the lineage (§20)
 *  - clears a pending customer revision request on the source (§11)
 */
async function createRevision(sourceQuotationId, staffUser, payload = {}) {
  const source = await prisma.quotation.findUnique({
    where: { id: sourceQuotationId },
    include: LINES_INCLUDE,
  });
  if (!source) throw ApiError.notFound("Quotation not found");

  if (canEditInPlace(source.status)) {
    throw ApiError.badRequest(
      "This quotation is still a draft — edit it directly instead of creating a new version.",
    );
  }
  if (!canCreateRevision(source.status)) {
    throw ApiError.badRequest(`A ${source.status.toLowerCase()} quotation can't be revised.`);
  }

  // Block a second open draft in the same lineage (§19/§20).
  const groupVersions = await prisma.quotation.findMany({
    where: { quotationGroupId: source.quotationGroupId },
    select: { id: true, version: true, status: true },
  });
  const existingDraft =
    newerDraftVersion(groupVersions, source.version) || groupVersions.find((v) => v.status === "DRAFT");
  if (existingDraft) {
    throw ApiError.conflict(`A draft version already exists: V${existingDraft.version}. Open that draft to continue.`, {
      quotationId: existingDraft.id,
      version: existingDraft.version,
    });
  }

  const party =
    payload.party && Object.keys(payload.party).length ? normalizeParty(payload.party) : partyFromQuotation(source);
  if (!party.partyName) throw ApiError.badRequest("A customer / company name is required.");

  let sourceLines = payload.lines && payload.lines.length ? payload.lines : buildLinesFromQuotation(source);
  sourceLines = await fillMissingProductRates(prisma, sourceLines || []);

  const created = await insertQuotationVersion({
    originType: source.originType,
    originDetail: source.originDetail || null,
    rfqId: source.rfqId || null,
    quotationGroupId: source.quotationGroupId,
    groupReference: source.groupReference || null,
    party,
    supersedes: source,
    version: await nextVersion(source.quotationGroupId),
    payload,
    staffUser,
    sourceLines: sourceLines || [],
  });

  // If the customer's last word on the source was a revision request,
  // creating this version answers it — clear the pending flag now, without
  // waiting for any customer accept/decline (§11).
  const sourceActivity = await loadQuotationActivity(source.id);
  if (hasPendingRevisionRequest(sourceActivity)) {
    await recordStaffActivity(prisma, {
      ...(source.rfqId ? { rfqId: source.rfqId } : { quotationId: source.id }),
      type: "REVISION_REQUEST_ADDRESSED",
      staffUserId: staffUser.id,
      metadata: { quotationId: source.id, version: source.version, newVersionId: created.id, newVersion: created.version },
    });
  }

  return created;
}

/**
 * New quotation version from an RFQ. A revision (`supersedesId`) is routed
 * through the unified `createRevision` path — it no longer needs the RFQ.
 * A first version's lines default to (in order): caller-supplied → the
 * RFQ's CURRENT WORKING requirement (Phase C) → the original RFQ items
 * (legacy fallback). Independently editable after creation — no sync (§62).
 */
async function createQuotation(rfqId, staffUser, payload) {
  if (payload.supersedesId) return createRevision(payload.supersedesId, staffUser, payload);

  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: { contact: { include: { company: true } } },
  });
  if (!rfq) throw ApiError.notFound("RFQ not found");

  let sourceLines = payload.lines;
  if (!sourceLines || sourceLines.length === 0) {
    await ensureWorkingItems(rfqId);
    const working = await prisma.rfqWorkingItem.findMany({ where: { rfqId }, orderBy: { sortOrder: "asc" } });
    if (working.length) {
      const priceMap = await loadProductPriceMap(prisma, working);
      sourceLines = buildLinesFromWorkingItems(working, priceMap);
    } else {
      sourceLines = buildLinesFromRfqItems(
        (await prisma.rFQ.findUnique({ where: { id: rfqId }, include: { items: true } })).items,
      );
    }
  }

  return insertQuotationVersion({
    originType: "RFQ",
    rfqId,
    quotationGroupId: rfqId,
    groupReference: null,
    party: partyFromRfq(rfq),
    supersedes: null,
    version: await nextVersion(rfqId),
    payload,
    staffUser,
    sourceLines,
  });
}

/**
 * Standalone quotation — no RFQ (§29). Same engine, editor, PDF and public
 * page. A revision (`supersedesId`) goes through the unified path. V1
 * mints a fresh group id + a PL-QT-… group reference. `origin`/`originDetail`
 * record the actual sales channel (§14).
 */
async function createManualQuotation(staffUser, payload) {
  if (payload.supersedesId) return createRevision(payload.supersedesId, staffUser, payload);

  const originType = payload.origin || "MANUAL";
  const party = normalizeParty(payload.party);
  if (!party.partyName) {
    throw ApiError.badRequest("A customer / company name is required for a standalone quotation.");
  }

  let sourceLines = await fillMissingProductRates(prisma, payload.lines || []);

  return insertQuotationVersion({
    originType,
    originDetail: (payload.originDetail || "").trim() || null,
    rfqId: null,
    quotationGroupId: crypto.randomUUID(),
    groupReference: await generateQuotationGroupReference(),
    party,
    supersedes: null,
    version: 1,
    payload,
    staffUser,
    sourceLines: sourceLines || [],
  });
}

/**
 * Staff-void a mistakenly issued quotation (§12). Not the same as a
 * customer REJECTED. Allowed from DRAFT/SENT/VIEWED. The record is kept,
 * the customer link is revoked, and the public page shows "no longer
 * active". A CANCELLED version cannot be revised.
 */
async function cancelQuotation(id, staffUser, { reason } = {}) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  if (quotation.status === "CANCELLED") return getQuotation(id);
  if (!canCancel(quotation.status)) {
    throw ApiError.badRequest(`A ${quotation.status.toLowerCase()} quotation can't be cancelled.`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: (reason || "").trim() || null,
        accessTokenRevokedAt: quotation.accessTokenHash ? new Date() : quotation.accessTokenRevokedAt,
      },
    });
    await recordStaffActivity(tx, {
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: id }),
      type: "QUOTATION_CANCELLED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version, reason: (reason || "").trim() || undefined },
    });
  });

  return getQuotation(id);
}

async function updateQuotation(id, staffUser, payload) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  assertEditable(quotation);

  const { lines, subtotal, grandTotal } = computeQuotationTotals(payload.lines || [], payload.taxAmount);

  // Party details are editable on ANY draft, whatever the origin (§7).
  // The first RFQ-origin version seeds its party from the RFQ; from then
  // on the quotation's own snapshot is authoritative and a staff
  // correction (GSTIN, address, contact) sticks and carries to revisions.
  // Wholesale replace, like the line list. Frozen once SENT.
  let partyPatch = {};
  if (payload.party) {
    partyPatch = normalizeParty(payload.party);
    if (!partyPatch.partyName) throw ApiError.badRequest("A customer / company name is required.");
  }

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
        // Preserve the existing validity when an edit doesn't restate it —
        // consistent with taxMode/customerNotes above, and it keeps the
        // 7-day default set at creation from being silently wiped (task §1).
        validUntil: payload.validUntil ? new Date(payload.validUntil) : quotation.validUntil,
        customerNotes: payload.customerNotes ?? quotation.customerNotes,
        ...partyPatch,
      },
      include: LINES_INCLUDE,
    });

    await recordStaffActivity(tx, {
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: id }),
      type: "QUOTATION_UPDATED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version },
    });

    return updated;
  });
}

/**
 * Explicit "Import Current RFQ items" for a DRAFT quotation that has no
 * meaningful product lines yet (§61) — e.g. a draft created before
 * auto-population existed. Only safe when the draft carries nothing worth
 * keeping: zero lines, or lines that are all empty/zero. Never runs
 * automatically and never syncs after this (§62).
 */
async function importRfqItems(id, staffUser) {
  const quotation = await prisma.quotation.findUnique({ where: { id }, include: { lines: true } });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  assertEditable(quotation);

  const hasMeaningfulLine = (quotation.lines || []).some(
    (l) => (l.quantity && l.quantity > 0) || (l.lineTotal != null && Number(l.lineTotal) !== 0) || l.productId,
  );
  if (hasMeaningfulLine) {
    throw ApiError.badRequest(
      "This draft already has lines. Add products individually rather than replacing the whole list.",
    );
  }

  if (!quotation.rfqId) throw ApiError.badRequest("This quotation has no RFQ to import from.");
  await ensureWorkingItems(quotation.rfqId);
  const working = await prisma.rfqWorkingItem.findMany({
    where: { rfqId: quotation.rfqId },
    orderBy: { sortOrder: "asc" },
  });
  let sourceLines = buildLinesFromWorkingItems(working, await loadProductPriceMap(prisma, working));
  if (!sourceLines.length) {
    const rfq = await prisma.rFQ.findUnique({ where: { id: quotation.rfqId }, include: { items: true } });
    sourceLines = buildLinesFromRfqItems(rfq?.items || []);
  }
  if (!sourceLines.length) throw ApiError.badRequest("The RFQ has no current requirement to import.");

  const { lines, subtotal, grandTotal } = computeQuotationTotals(sourceLines, quotation.taxAmount);

  return prisma.$transaction(async (tx) => {
    await writeLines(tx, id, lines);
    const updated = await tx.quotation.update({
      where: { id },
      data: { subtotal, grandTotal },
      include: LINES_INCLUDE,
    });
    await recordStaffActivity(tx, {
      rfqId: quotation.rfqId,
      type: "QUOTATION_UPDATED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version, action: "imported_rfq_items", lineCount: lines.length },
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
/**
 * Everything that must be true before a quotation can be SENT (§12).
 * Returns a list of human-readable blockers — empty means sendable.
 * Save-as-draft has none of these checks; they apply only at send time.
 */
function quotationSendBlockers(quotation) {
  const blockers = [];
  const lines = quotation.lines || [];
  if (!lines.length) {
    blockers.push("Add at least one product or service line.");
    return blockers;
  }
  const needRate = lines.filter(
    (l) =>
      (l.lineType === "PRODUCT" || l.lineType === "SHIPPING") &&
      l.lineTotal == null &&
      !(l.quantity != null && l.unitPrice != null),
  );
  if (needRate.length) {
    blockers.push(
      needRate.length === 1
        ? "1 line still needs a rate."
        : `${needRate.length} lines still need a rate.`,
    );
  }
  for (const l of lines) {
    if ((l.lineType === "PRODUCT" || l.lineType === "SHIPPING") && l.unitPrice != null && (l.quantity == null || l.quantity <= 0)) {
      blockers.push(`"${l.description}" has a rate but no valid quantity.`);
      break;
    }
  }
  if (!quotation.validUntil) blockers.push("Set a valid-until date.");
  if (quotation.grandTotal == null || Number(quotation.grandTotal) <= 0) {
    blockers.push("The grand total must be greater than zero.");
  }
  if (quotation.originType === "MANUAL" && !quotation.partyName) {
    blockers.push("Enter the customer / company name.");
  }
  return blockers;
}

async function sendQuotation(id, staffUser) {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  assertEditable(quotation);

  const blockers = quotationSendBlockers(quotation);
  if (blockers.length) {
    throw ApiError.badRequest(`This quotation isn't ready to send: ${blockers.join(" ")}`);
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
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: id }),
      type: "QUOTATION_SENT",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version, grandTotal: Number(updated.grandTotal) },
    });

    if (quotation.rfqId) {
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
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: id }),
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
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: id }),
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

    await recordStaffActivity(tx, {
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: id }),
      type: "QUOTATION_ACCEPTED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version },
    });

    if (quotation.rfqId) {
      const rfq = await tx.rFQ.findUnique({ where: { id: quotation.rfqId } });
      await tx.rFQ.update({ where: { id: quotation.rfqId }, data: { status: "WON" } });
      await recordStaffActivity(tx, {
        rfqId: quotation.rfqId,
        type: "STATUS_CHANGED",
        staffUserId: staffUser.id,
        metadata: { from: rfq.status, to: "WON", reason: "quotation_accepted" },
      });
    }

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
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: id }),
      type: "QUOTATION_REJECTED",
      staffUserId: staffUser.id,
      metadata: { quotationId: id, version: quotation.version },
    });

    if (nextRfqStatus && quotation.rfqId) {
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
  // Exported for unit testing — see test/productCodeSnapshot.test.js, test/quotationWorkspace.test.js
  writeLines,
  buildLinesFromRfqItems,
  buildLinesFromWorkingItems,
  buildLinesFromQuotation,
  normalizeParty,
  partyFromRfq,
  quotationSendBlockers,
  usableRate,
  partyFromQuotation,
  listQuotationsForRfq,
  listQuotations,
  getQuotation,
  createQuotation,
  createManualQuotation,
  createRevision,
  updateQuotation,
  cancelQuotation,
  importRfqItems,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  regenerateAccessToken,
  revokeAccessToken,
};
