const { z } = require("zod");
const { contactSchema, submissionEnvelopeSchema } = require("./common.schema");

const customizationSideSchema = z.object({
  enabled: z.boolean(),
  placementKey: z.string().trim().min(1).max(80).optional(),
  artworkAssetId: z.string().uuid().optional(),
});

const rfqItemSchema = z
  .object({
    productId: z.string().trim().min(1).max(200).optional(), // catalogue product slug
    description: z.string().trim().min(1).max(300).optional(), // described/custom item
    colorId: z.string().trim().min(1).max(100).optional(), // color slug
    variantId: z.string().trim().min(1).max(100).optional(), // variant code
    quantity: z.coerce.number().int().positive().max(1_000_000).optional(),
    customizationData: z
      .object({
        front: customizationSideSchema.optional(),
        back: customizationSideSchema.optional(),
      })
      .optional(),
  })
  .strict()
  .refine((item) => Boolean(item.productId) || Boolean(item.description), {
    message: "Each item needs either a catalogue product or a description.",
    path: ["productId"],
  });

const createRfqSchema = z
  .object({
    contact: contactSchema,
    message: z.string().trim().max(2000).optional().or(z.literal("")),
    deliveryCity: z.string().trim().max(100).optional().or(z.literal("")),
    deliveryPin: z.string().trim().max(12).optional().or(z.literal("")),
    // Kit Builder / conceptual-collection requirements that don't map to a
    // discrete RFQItem — free-form by design, see Phase 2 §17.
    requirementData: z.record(z.string(), z.any()).optional(),
    items: z.array(rfqItemSchema).min(1, "Add at least one item").max(50),
    ...submissionEnvelopeSchema,
  })
  .strict();

module.exports = { createRfqSchema };
