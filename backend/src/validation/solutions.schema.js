const { z } = require("zod");

const boolFromString = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => v === true || v === "true")
  .optional();

const listSolutionsQuerySchema = z.object({ featured: boolFromString }).strict();

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

module.exports = { listSolutionsQuerySchema, slugParamSchema };
