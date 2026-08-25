const { sanitizeFileName } = require("../services/storage/keys");

/**
 * Forces every artwork response to download rather than render inline
 * (Production Hardening Patch §1/§3). This is deliberately the primary
 * defense against a sanitizer bypass, not a backup to it: even a
 * perfectly-sanitized SVG never gets a chance to execute if the browser
 * never renders it in the first place. `filename` is re-sanitized here
 * (not just trusted from the DB) since it ultimately reaches an HTTP
 * header value — no quotes/CRLF/path separators can survive
 * sanitizeFileName's charset allowlist.
 */
function safeDownloadFilename(originalFileName) {
  return sanitizeFileName(originalFileName) || "artwork";
}

/** Applies the attachment + no-sniff headers to an Express response (local storage path). */
function applyAttachmentHeaders(res, originalFileName) {
  res.setHeader("Content-Disposition", `attachment; filename="${safeDownloadFilename(originalFileName)}"`);
  res.setHeader("X-Content-Type-Options", "nosniff");
}

module.exports = { safeDownloadFilename, applyAttachmentHeaders };
