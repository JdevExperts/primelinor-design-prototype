/**
 * Prevents the demo/dev seed from ever running against a production
 * database (Production Hardening Patch §8) — `prisma/seed.js` deletes and
 * recreates its 5 demo products by slug on every run, which is exactly
 * the kind of thing that should never fire against real commercial data.
 * Development (NODE_ENV unset or "development") is completely
 * unaffected — no extra step, no friction. The explicit
 * `ALLOW_DEV_SEED=true` escape hatch exists for a genuine one-off need
 * (e.g. seeding a fresh production DB's catalogue for the very first
 * time before real products exist) without weakening the default guard.
 */
function assertSeedAllowed(env = process.env) {
  if (env.NODE_ENV === "production" && env.ALLOW_DEV_SEED !== "true") {
    throw new Error(
      "Refusing to run the development seed with NODE_ENV=production. " +
        "If this is genuinely intended, re-run with ALLOW_DEV_SEED=true.",
    );
  }
}

module.exports = { assertSeedAllowed };
