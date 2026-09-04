const { z } = require("zod");
const { RFQ_STATUSES } = require("./enums");
const { SOURCE_TYPES } = require("./common.schema");
const { rfqItemSchema } = require("./rfqs.schema");

const listRfqsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(RFQ_STATUSES).optional(),
    source: z.enum(SOURCE_TYPES).optional(),
    assignedTo: z.string().trim().min(1).max(100).optional(), // a StaffUser id, or "unassigned"
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    // Period pill — trailing window on RFQ.createdAt. Default 30 days.
    // An explicit dateFrom/dateTo (e.g. from a dashboard link) overrides it.
    period: z.enum(["today", "7d", "30d", "90d", "1y", "all"]).default("30d"),
    search: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

const idParamSchema = z.object({ id: z.string().uuid() }).strict();

const updateRfqSchema = z
  .object({
    status: z.enum(RFQ_STATUSES).optional(),
    assignedToUserId: z.string().uuid().nullable().optional(),
  })
  .strict()
  .refine((body) => body.status !== undefined || body.assignedToUserId !== undefined, {
    message: "Provide status and/or assignedToUserId.",
  });

const addNoteSchema = z.object({ body: z.string().trim().min(1).max(4000) }).strict();

// ── Working requirement (Phase C) ────────────────────────────────────────
const addWorkingItemSchema = z
  .object({
    productId: z.string().uuid().optional(),
    description: z.string().trim().min(1).max(300).optional(),
    quantity: z.coerce.number().int().positive().max(1_000_000).optional(),
    unit: z.string().trim().max(40).optional(),
  })
  .strict()
  .refine((body) => body.productId || body.description, {
    message: "Pick a catalogue product or enter a description.",
    path: ["productId"],
  });

const updateWorkingItemSchema = z
  .object({
    quantity: z.coerce.number().int().positive().max(1_000_000).nullable().optional(),
    unit: z.string().trim().max(40).nullable().optional(),
    description: z.string().trim().max(300).nullable().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: "Nothing to update." });

const reorderWorkingItemsSchema = z.object({ orderedIds: z.array(z.string().uuid()).min(1).max(200) }).strict();

const workingItemParamSchema = z.object({ id: z.string().uuid(), itemId: z.string().uuid() }).strict();

module.exports = {
  listRfqsQuerySchema,
  idParamSchema,
  updateRfqSchema,
  addNoteSchema,
  rfqItemSchema,
  addWorkingItemSchema,
  updateWorkingItemSchema,
  reorderWorkingItemsSchema,
  workingItemParamSchema,
};
