/**
 * Structured-ish request logger — one line per request, machine-parseable
 * enough for a log aggregator later without pulling in a logging library.
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    const line = {
      ts: new Date().toISOString(),
      method: req.method,
      path: (req.originalUrl || req.url).split("?")[0],
      status: res.statusCode,
      ms,
    };
    process.stdout.write(`${JSON.stringify(line)}\n`);
  });

  next();
}

module.exports = requestLogger;
