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

module.exports = { listRfqsQuerySchema, idParamSchema, updateRfqSchema, addNoteSchema, rfqItemSchema };
