/**
 * Minimal safe server-side logging (Production Hardening Patch §12).
 * `errorHandler.js`'s catch-all previously did `console.error(err)` on
 * every unexpected error — for a raw Prisma error, `err.message`/`err.meta`
 * can embed the actual query parameter values that triggered it (which,
 * for this app, can mean a phone number, email, or customer message), so
 * dumping the whole object server-side was itself a PII-in-logs risk even
 * though the *client* response was already safely masked. Only ApiError
 * instances carry a message that's meant to be shown/logged as-is —
 * anything reaching these helpers is, by definition, unexpected.
 *
 * In production: log only name/code/where — never the raw message/meta/
 * stack, since those are exactly where request-derived values leak.
 * In development: the full error (including stack) is still printed,
 * since local dev logs aren't shipped anywhere and a stack trace is
 * genuinely useful while working on the code.
 */
function isProduction() {
  return process.env.NODE_ENV === "production";
}

/** For an unexpected error caught while handling a request. */
function logSafeError(err, context = {}) {
  if (!isProduction()) {
    console.error(context.label ? `[${context.label}]` : "[error]", err);
    return;
  }

  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      label: context.label || "unexpected",
      name: err?.name,
      code: err?.code,
      method: context.method,
      path: context.path,
    }),
  );
}

/**
 * For a failure at process startup (config/DB connectivity) — these are
 * read by whoever is deploying, not triggered by a customer request, so
 * name+message is printed even in production (an operator needs enough to
 * fix the deploy) but never the full stack/raw driver error object, which
 * for a DB connection failure can otherwise be verbose enough to include
 * connection details.
 */
function logSafeStartupError(label, err) {
  console.error(`[startup] ${label} failed: ${err?.name || "Error"}${err?.message ? ` — ${err.message}` : ""}`);
  if (!isProduction() && err?.stack) {
    console.error(err.stack);
  }
}

module.exports = { logSafeError, logSafeStartupError };
