const { z } = require("zod");
const { EVENT_TYPES, SEARCH_QUERY_MAX } = require("../services/analyticsIngest");

// A single client analytics event. Everything optional except the type
// and an anonymous visitor id. Strings are bounded so a malformed client
// can't bloat a row; unknown keys are rejected.
const analyticsEventSchema = z
  .object({
    eventType: z.enum(EVENT_TYPES),
    visitorId: z.string().trim().min(6).max(64),
    sessionId: z.string().trim().min(6).max(64).optional(),
    path: z.string().trim().max(512).optional(),
    referrer: z.string().trim().max(512).optional().or(z.literal("")),
    utmSource: z.string().trim().max(120).optional().or(z.literal("")),
    utmMedium: z.string().trim().max(120).optional().or(z.literal("")),
    utmCampaign: z.string().trim().max(120).optional().or(z.literal("")),
    productId: z.string().trim().max(64).optional(),
    productCode: z.string().trim().max(32).optional(),
    categoryId: z.string().trim().max(64).optional(),
    solutionId: z.string().trim().max(64).optional(),
    searchQuery: z.string().trim().max(SEARCH_QUERY_MAX + 40).optional(),
    searchResultCount: z.coerce.number().int().min(0).max(100000).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .strict();

// The ingest endpoint accepts one event or a small batch (sendBeacon
// flushes a queue on page hide).
const analyticsIngestSchema = z.union([
  analyticsEventSchema,
  z.object({ events: z.array(analyticsEventSchema).min(1).max(20) }).strict(),
]);

module.exports = { analyticsEventSchema, analyticsIngestSchema };
