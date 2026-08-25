const { z } = require("zod");
const { contactSchema, submissionEnvelopeSchema } = require("./common.schema");

const createLeadSchema = z
  .object({
    contact: contactSchema,
    message: z.string().trim().min(1, "Please add a short message").max(2000),
    ...submissionEnvelopeSchema,
  })
  .strict();

module.exports = { createLeadSchema };
