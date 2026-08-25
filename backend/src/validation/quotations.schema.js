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
  .refine((line) => (line.quantity != null && line.unitPrice != null) || line.lineTotal != null, {
    message: "Provide quantity and unit price, or a line amount.",
    path: ["lineTotal"],
  })
  .refine(
    (line) => {
      if (line.lineType !== "DISCOUNT") return true;
      const amount = line.quantity != null && line.unitPrice != null ? line.quantity * line.unitPrice : line.lineTotal;
      return amount != null && amount <= 0;
    },
    { message: "Discount lines must be zero or negative.", path: ["lineTotal"] },
  );

const quotationBaseFields = {
  currency: z.string().trim().length(3).optional(),
  lines: z.array(quotationLineSchema).max(200).default([]),
  taxMode: z.string().trim().max(60).optional(),
  taxAmount: z.coerce.number().min(-10_000_000).max(10_000_000).optional(),
  validUntil: z.coerce.date().optional(),
  customerNotes: z.string().trim().max(4000).optional(),
};

const createQuotationSchema = z
  .object({
    supersedesId: z.string().uuid().optional(),
    ...quotationBaseFields,
  })
  .strict();

const updateQuotationSchema = z.object(quotationBaseFields).strict();

const rejectQuotationSchema = z
  .object({
    nextRfqStatus: z.enum(["NEGOTIATING", "LOST"]).optional(),
  })
  .strict();

const rfqIdParamSchema = z.object({ rfqId: z.string().uuid() }).strict();
const idParamSchema = z.object({ id: z.string().uuid() }).strict();

module.exports = {
  quotationLineSchema,
  createQuotationSchema,
  updateQuotationSchema,
  rejectQuotationSchema,
  rfqIdParamSchema,
  idParamSchema,
};
