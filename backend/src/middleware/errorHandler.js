const ApiError = require("../utils/ApiError");
const { logSafeError } = require("../utils/safeLog");

/**
 * Centralized error handler — must be registered last.
 *
 * Expected errors (ApiError — bad input, not found) return their real,
 * safe message. Anything else is masked with a generic message to the
 * client, so unexpected exceptions (e.g. a raw Prisma error) never leak
 * internal details over the API. Server-side logging of the unexpected
 * case goes through logSafeError (Production Hardening Patch §12) rather
 * than dumping the raw error object — a Prisma error's own message/meta
 * can embed the request's actual values (phone, email, message text),
 * which a plain console.error(err) would otherwise print in full.
 */
function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message, ...(err.details ? { details: err.details } : {}) });
  }

  if (err?.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large — please keep it under 10 MB." : "Upload failed.";
    return res.status(400).json({ success: false, message });
  }

  if (err?.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: err.issues?.[0]?.message || "Invalid request",
    });
  }

  if (err?.name === "PrismaClientInitializationError" || err?.code === "P1001") {
    logSafeError(err, { label: "db-unreachable", method: req.method, path: req.path });
    return res.status(503).json({
      success: false,
      message: "Database is unavailable. Please try again shortly.",
    });
  }

  // Unexpected — logged safely server-side, never forwarded to the client.
  logSafeError(err, { label: "unhandled", method: req.method, path: req.path });
  res.status(500).json({ success: false, message: "Internal Server Error" });
}

module.exports = errorHandler;
