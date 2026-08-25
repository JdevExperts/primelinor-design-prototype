const { z } = require("zod");

const tokenParamSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(20)
      .max(200)
      .regex(/^[A-Za-z0-9_-]+$/, "Invalid link"),
  })
  .strict();

const customerMessageSchema = z
  .object({
    message: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .strict();

module.exports = { tokenParamSchema, customerMessageSchema };
