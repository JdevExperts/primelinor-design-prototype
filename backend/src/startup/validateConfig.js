/**
 * Centralized startup config validation (Production Hardening Patch §13).
 * One place that answers "what does this deployment need to actually
 * work", checked once at boot rather than discovered piecemeal via
 * whichever code path first touches a missing var. Collects every problem
 * before reporting, rather than failing on the first one, so a
 * misconfigured deploy gets one complete error list instead of a
 * fix-one-restart-find-the-next loop.
 *
 * DATABASE_URL is required in every environment — nothing here has a
 * sensible fallback for "no database". JWT_SECRET, FRONTEND_ORIGIN,
 * PUBLIC_APP_URL and object storage credentials all have safe,
 * self-contained development defaults/fallbacks (see auth.js, this
 * file's own defaults, storage/index.js) and only become hard
 * requirements once NODE_ENV=production, where a silent fallback (e.g.
 * an admin cookie scoped to "localhost:5173", or artwork silently
 * landing on ephemeral local disk) would be a real production incident,
 * not a convenience.
 */
const WHATSAPP_NUMBER_RE = /^\d{8,15}$/;

const ALWAYS_REQUIRED = ["DATABASE_URL"];
const REQUIRED_IN_PRODUCTION = ["JWT_SECRET", "FRONTEND_ORIGIN", "PUBLIC_APP_URL"];

function hasObjectStorageConfigured(env) {
  return Boolean(env.AWS_S3_BUCKET?.trim() && env.AWS_ACCESS_KEY_ID?.trim() && env.AWS_SECRET_ACCESS_KEY?.trim());
}

/** Pure function — takes an env object (defaults to process.env) so it's trivially unit-testable. */
function validateConfig(env = process.env) {
  const errors = [];
  const isProduction = env.NODE_ENV === "production";

  for (const key of ALWAYS_REQUIRED) {
    if (!env[key]?.trim()) errors.push(`${key} is required.`);
  }

  if (isProduction) {
    for (const key of REQUIRED_IN_PRODUCTION) {
      if (!env[key]?.trim()) errors.push(`${key} is required when NODE_ENV=production.`);
    }
    if (!hasObjectStorageConfigured(env)) {
      errors.push(
        "AWS_S3_BUCKET, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are all required when NODE_ENV=production " +
          "— customer artwork must not silently fall back to local disk storage in production.",
      );
    }
  }

  if (env.WHATSAPP_NUMBER?.trim() && !WHATSAPP_NUMBER_RE.test(env.WHATSAPP_NUMBER.trim())) {
    errors.push("WHATSAPP_NUMBER must be digits only, with country code (e.g. 919812345678).");
  }

  return { ok: errors.length === 0, errors };
}

module.exports = { validateConfig, hasObjectStorageConfigured, ALWAYS_REQUIRED, REQUIRED_IN_PRODUCTION, WHATSAPP_NUMBER_RE };
