const ApiError = require("../utils/ApiError");

/**
 * Centralized error handler — must be registered last.
 *
 * Expected errors (ApiError — bad input, not found) return their real,
 * safe message. Anything else is logged in full server-side and masked
 * with a generic message to the client, so unexpected exceptions (e.g. a
 * raw Prisma error) never leak internal details over the API.
 */
function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
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
    console.error("[db] unreachable:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database is unavailable. Please try again shortly.",
    });
  }

  // Unexpected — log full detail server-side, never forward err.message.
  console.error(err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
}

module.exports = errorHandler;
