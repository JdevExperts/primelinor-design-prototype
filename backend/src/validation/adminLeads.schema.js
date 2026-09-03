const { z } = require("zod");
const { LEAD_STATUSES } = require("./enums");
const { SOURCE_TYPES } = require("./common.schema");
const { rfqItemSchema } = require("./rfqs.schema");

const listLeadsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.enum(SOURCE_TYPES).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    // Period pill — trailing window on Lead.createdAt. Default 30 days.
    period: z.enum(["today", "7d", "30d", "90d", "1y", "all"]).default("30d"),
    search: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

const idParamSchema = z.object({ id: z.string().uuid() }).strict();

const updateLeadSchema = z.object({ status: z.enum(LEAD_STATUSES) }).strict();

const convertLeadSchema = z
  .object({
    message: z.string().trim().max(2000).optional(),
    deliveryCity: z.string().trim().max(100).optional(),
    deliveryPin: z.string().trim().max(12).optional(),
    requirementData: z.record(z.string(), z.any()).optional(),
    items: z.array(rfqItemSchema).max(50).optional(),
  })
  .strict();

module.exports = { listLeadsQuerySchema, idParamSchema, updateLeadSchema, convertLeadSchema };
