const asyncHandler = require("../utils/asyncHandler");
const prisma = require("../lib/prisma");
const { buildEventRow } = require("../services/analyticsIngest");
const { logSafeError } = require("../utils/safeLog");

/**
 * POST /api/v1/analytics/collect — public, rate-limited, fire-and-forget.
 *
 * Always answers 204 the moment the payload is accepted for processing,
 * even if a row is ultimately dropped (bot / admin path) or the DB write
 * fails: analytics must NEVER surface an error to the website (§14). The
 * insert is not awaited by the response.
 */
exports.collect = asyncHandler(async (req, res) => {
  const body = req.validated.body;
  const events = Array.isArray(body?.events) ? body.events : [body];

  const ctx = {
    userAgent: req.get("user-agent") || "",
    headers: req.headers || {},
    // TEST-DATA marker (§44): set only by an explicit dev header, never in
    // production. Lets Phase 6C-2 delete seeded rows with WHERE is_test.
    isTest: req.get("x-pl-analytics-test") === "1",
  };

  const rows = events.map((e) => buildEventRow(e, ctx)).filter(Boolean);

  res.status(204).end();

  if (!rows.length) return;
  prisma.analyticsEvent
    .createMany({ data: rows })
    .catch((err) => logSafeError(err, { label: "analytics-ingest", method: req.method, path: req.path }));
});
