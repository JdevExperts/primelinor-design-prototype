const { z } = require("zod");

/** Mirrors the Prisma SourceType enum — kept in sync manually (small, stable list). */
const SOURCE_TYPES = [
  "HEADER_QUOTE",
  "PDP",
  "CUSTOMIZATION_STUDIO",
  "CORPORATE_GIFTING",
  "KIT_BUILDER",
  "SOLUTION",
  "CONTACT",
  "ABOUT",
  "OTHER",
];

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(6, "A valid phone number is required").max(20),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  companyName: z.string().trim().max(160).optional().or(z.literal("")),
});

const utmSchema = z
  .object({
    source: z.string().trim().max(100).optional(),
    medium: z.string().trim().max(100).optional(),
    campaign: z.string().trim().max(100).optional(),
    content: z.string().trim().max(100).optional(),
  })
  .optional();

/**
 * Shared by both Lead and RFQ payloads. `submissionId` is a client-generated
 * UUID used purely for idempotency (Phase 2 §14) — a retried submit with the
 * same id returns the original record instead of creating a duplicate.
 * `website` is a honeypot: real users never see or fill this field, so any
 * non-empty value marks the submission as spam (handled in the controller,
 * not here, so a spam submission still gets a normal-looking success
 * response rather than a tell-tale validation error).
 */
const submissionEnvelopeSchema = {
  submissionId: z.string().uuid("Invalid submission id"),
  sourceType: z.enum(SOURCE_TYPES),
  sourcePath: z.string().trim().min(1).max(300),
  sourceContext: z.record(z.string(), z.any()).optional(),
  utm: utmSchema,
  website: z.string().max(200).optional().or(z.literal("")),
};

module.exports = { SOURCE_TYPES, contactSchema, utmSchema, submissionEnvelopeSchema };
