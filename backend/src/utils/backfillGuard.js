/**
 * Shared safety guard for one-time backfill/cleanup scripts (mirrors
 * seedGuard.js's reasoning, generalized past the one dev-seed case):
 * refuses outright in production, and requires an explicit per-script
 * opt-in env var flag even in dev unless the caller only asked for a
 * `--dry-run` preview. Used by scripts/backfillSolutions.js and
 * scripts/cleanupPhase5TestData.js.
 */
function assertBackfillAllowed(env, { flagName, dryRun, label }) {
  if (env.NODE_ENV === "production") {
    throw new Error(`[${label}] Refusing to run: NODE_ENV=production. This script never runs against production.`);
  }
  if (env[flagName] !== "true" && !dryRun) {
    throw new Error(
      `[${label}] Refusing to run without explicit opt-in. Set ${flagName}=true to actually write, ` +
        "or pass --dry-run to preview without writing anything.",
    );
  }
}

module.exports = { assertBackfillAllowed };
