const { z } = require("zod");
const { QUOTATION_LINE_TYPES } = require("./enums");

/**
 * A line needs either (quantity + unitPrice) so the server can compute
 * lineTotal, or a directly staff-entered lineTotal (a flat fee, or any
 * DISCOUNT/ADJUSTMENT amount) — see quotationTotals.js for which one wins
 * when both are present. DISCOUNT lines must be zero or negative: the one
 * consistent mechanism for a price reduction, never a hidden override
 * (Phase 3 §21).
 */
const quotationLineSchema = z
  .object({
    rfqItemId: z.string().uuid().optional(),
    // Catalogue product backing a PRODUCT line, plus its frozen identity.
    productId: z.string().uuid().optional(),
    productCode: z.string().trim().max(20).optional(),
    lineType: z.enum(QUOTATION_LINE_TYPES),
    description: z.string().trim().min(1).max(300),
    quantity: z.coerce.number().int().positive().max(1_000_000).optional(),
    unit: z.string().trim().max(40).optional(),
    unitPrice: z.coerce.number().nonnegative().max(10_000_000).optional(),
    lineTotal: z.coerce.number().min(-10_000_000).max(10_000_000).optional(),
    sortOrder: z.coerce.number().int().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .strict()
  .refine(
    (line) => {
      if ((line.quantity != null && line.unitPrice != null) || line.lineTotal != null) return true;
      // A PRODUCT/SHIPPING line with a quantity but no rate yet is a valid
      // DRAFT state (sales still negotiating) — it just can't be SENT. A
      // DISCOUNT/ADJUSTMENT line always needs an explicit amount.
      return (line.lineType === "PRODUCT" || line.lineType === "SHIPPING") && line.quantity != null;
    },
    {
      message: "Provide a quantity (a rate can be added before sending), or a line amount.",
      path: ["lineTotal"],
    },
  )
  .refine(
    (line) => {
      if (line.lineType !== "DISCOUNT") return true;
      const amount = line.quantity != null && line.unitPrice != null ? line.quantity * line.unitPrice : line.lineTotal;
      return amount != null && amount <= 0;
    },
    { message: "Discount lines must be zero or negative.", path: ["lineTotal"] },
  );

// Party snapshot for a MANUAL (standalone) quotation — no CRM model (AA-2).
const quotationPartySchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    contactPerson: z.string().trim().max(120).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    email: z.string().trim().max(200).optional().or(z.literal("")),
    gstin: z.string().trim().max(20).optional().or(z.literal("")),
    address: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .strict();

const quotationBaseFields = {
  currency: z.string().trim().length(3).optional(),
  lines: z.array(quotationLineSchema).max(200).default([]),
  taxMode: z.string().trim().max(60).optional(),
  taxAmount: z.coerce.number().min(-10_000_000).max(10_000_000).optional(),
  validUntil: z.coerce.date().optional(),
  customerNotes: z.string().trim().max(4000).optional(),
};

const QUOTATION_ORIGINS = ["MANUAL", "PHONE", "WHATSAPP", "OFFLINE"];

const createQuotationSchema = z
  .object({
    supersedesId: z.string().uuid().optional(),
    ...quotationBaseFields,
  })
  .strict();

// Standalone quotation: same commercial fields + a party (required on V1,
// carried forward on a revision if omitted) + the sales channel it came
// through (§14/§15).
const createManualQuotationSchema = z
  .object({
    supersedesId: z.string().uuid().optional(),
    origin: z.enum(QUOTATION_ORIGINS).optional(),
    originDetail: z.string().trim().max(300).optional().or(z.literal("")),
    party: quotationPartySchema.optional(),
    ...quotationBaseFields,
  })
  .strict()
  .refine((body) => body.supersedesId || body.party, {
    message: "Party details are required for a new standalone quotation.",
    path: ["party"],
  });

// New version of an existing lineage (§5). Every field optional — omitted
// values are cloned from the source version. `supersedesId` is the route
// param, not a body field.
const createRevisionSchema = z
  .object({ ...quotationBaseFields, party: quotationPartySchema.optional() })
  .strict();

const updateQuotationSchema = z
  .object({ ...quotationBaseFields, party: quotationPartySchema.optional() })
  .strict();

const cancelQuotationSchema = z
  .object({ reason: z.string().trim().max(500).optional().or(z.literal("")) })
  .strict();

const quotationNoteSchema = z.object({ body: z.string().trim().min(1).max(4000) }).strict();

const rejectQuotationSchema = z
  .object({
    nextRfqStatus: z.enum(["NEGOTIATING", "LOST"]).optional(),
  })
  .strict();

const listQuotationsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "SUPERSEDED", "CANCELLED"]).optional(),
    origin: z.enum(["RFQ", "MANUAL", "PHONE", "WHATSAPP", "OFFLINE"]).optional(),
    createdBy: z.string().uuid().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    search: z.string().trim().min(1).max(200).optional(),
    // "true" → only live offers past their valid-until date.
    expired: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
    // "1"/"true" → only threads whose latest version has an unresolved
    // customer revision request.
    pendingRevision: z
      .enum(["1", "true", "0", "false"])
      .transform((v) => v === "1" || v === "true")
      .optional(),
    // "active" → threads whose latest version is DRAFT/SENT/VIEWED and not
    // expired (the operational open pipeline). Thread-based, never counts
    // superseded versions.
    thread: z.enum(["active"]).optional(),
    // Period pill — trailing window on THREAD creation (first version's
    // createdAt), so a revision never re-surfaces an old quotation (§9).
    period: z.enum(["today", "7d", "30d", "90d", "1y", "all"]).default("30d"),
  })
  .strict();

const rfqIdParamSchema = z.object({ rfqId: z.string().uuid() }).strict();
const idParamSchema = z.object({ id: z.string().uuid() }).strict();
const quotationNoteParamSchema = z.object({ id: z.string().uuid(), noteId: z.string().uuid() }).strict();

module.exports = {
  quotationLineSchema,
  quotationPartySchema,
  createQuotationSchema,
  createManualQuotationSchema,
  createRevisionSchema,
  updateQuotationSchema,
  cancelQuotationSchema,
  quotationNoteSchema,
  rejectQuotationSchema,
  listQuotationsQuerySchema,
  rfqIdParamSchema,
  idParamSchema,
  quotationNoteParamSchema,
};
