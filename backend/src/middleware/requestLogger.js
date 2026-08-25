/**
 * Structured-ish request logger — one line per request, machine-parseable
 * enough for a log aggregator later without pulling in a logging library.
 *
 * The customer quote access token (Phase 4 §35) is a bearer credential
 * embedded in the URL path — it must never sit in plaintext in ordinary
 * logs, so `/api/v1/quotes/<token>[...]` is redacted before logging.
 */
const QUOTE_TOKEN_PATH_RE = /^(\/api\/v\d+\/quotes)\/[^/]+/;

function redactPath(path) {
  return path.replace(QUOTE_TOKEN_PATH_RE, "$1/[redacted]");
}

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    const line = {
      ts: new Date().toISOString(),
      method: req.method,
      path: redactPath((req.originalUrl || req.url).split("?")[0]),
      status: res.statusCode,
      ms,
    };
    process.stdout.write(`${JSON.stringify(line)}\n`);
  });

  next();
}

module.exports = requestLogger;
