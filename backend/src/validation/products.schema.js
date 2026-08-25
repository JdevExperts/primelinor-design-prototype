const { z } = require("zod");

const SORT_VALUES = ["recommended", "price_asc", "price_desc", "moq_asc", "newest"];

const boolFromString = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => v === true || v === "true")
  .optional();

const intFromString = z.coerce.number().int().positive().optional();
const numberFromString = z.coerce.number().nonnegative().optional();

const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
    category: z.string().trim().min(1).optional(),
    material: z.string().trim().min(1).optional(),
    color: z.string().trim().min(1).optional(),
    customizable: boolFromString,
    minGsm: intFromString,
    maxGsm: intFromString,
    minMoq: intFromString,
    maxMoq: intFromString,
    minPrice: numberFromString,
    maxPrice: numberFromString,
    sort: z.enum(SORT_VALUES).default("recommended"),
  })
  .strict();

const slugParamSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Invalid slug"),
  })
  .strict();

module.exports = { listProductsQuerySchema, slugParamSchema, SORT_VALUES };
