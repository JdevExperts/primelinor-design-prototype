const path = require("node:path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const productsRoutes = require("./src/routes/products.routes");
const categoriesRoutes = require("./src/routes/categories.routes");
const leadsRoutes = require("./src/routes/leads.routes");
const rfqsRoutes = require("./src/routes/rfqs.routes");
const uploadsRoutes = require("./src/routes/uploads.routes");
const artworkPreviewRoutes = require("./src/routes/artworkPreview.routes");
const adminAuthRoutes = require("./src/routes/adminAuth.routes");
const adminRoutes = require("./src/routes/admin.routes");
const publicQuotesRoutes = require("./src/routes/publicQuotes.routes");
const publicConfigRoutes = require("./src/routes/publicConfig.routes");
const { requireStaffAuth } = require("./src/middleware/requireStaffAuth");
const requireTrustedOrigin = require("./src/middleware/requireTrustedOrigin");
const errorHandler = require("./src/middleware/errorHandler");
const requestLogger = require("./src/middleware/requestLogger");
const noCache = require("./src/middleware/noCache");
const { validateConfig } = require("./src/startup/validateConfig");
const prisma = require("./src/lib/prisma");
const { logSafeStartupError } = require("./src/utils/safeLog");

const app = express();

if (process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    // Admin auth rides an HttpOnly cookie (Phase 3 §42) — the browser only
    // attaches/reads it on a cross-origin fetch when the response opts in.
    credentials: true,
  }),
);

app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Customer-intake writes (Phase 2) get a much tighter limit than read
// traffic — one legitimate user submits a handful of enquiries per visit,
// never dozens per minute.
const writeLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10 });
const uploadLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });
// Admin writes are a handful of staff doing an ordinary workday's worth of
// edits — generous compared to the public write limiter, but still a real
// ceiling against a compromised/malfunctioning admin session.
const adminWriteLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
// Public quote endpoints are token-gated but still rate-limited (Phase 4
// §35) against brute-forcing/enumeration attempts — generous enough for a
// customer legitimately refreshing/re-opening their link a few times.
const publicQuoteLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Local-disk product images (dev fallback only — see storage/productAssets.js;
// unused/empty when S3 is configured, since those URLs point directly at S3).
// helmet()'s default Cross-Origin-Resource-Policy: same-origin would
// otherwise block the frontend (a different origin/port in dev) from
// embedding these via <img> — these are meant to be public, cross-origin
// embeddable catalogue images, so that default is relaxed for this route
// only. Real S3 doesn't set this header at all, so production is
// unaffected either way.
app.use(
  "/product-assets",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "storage/products")),
);

app.use("/api/v1/products", noCache, productsRoutes);
app.use("/api/v1/categories", noCache, categoriesRoutes);
app.use("/api/v1/leads", writeLimiter, leadsRoutes);
app.use("/api/v1/rfqs", writeLimiter, rfqsRoutes);
app.use("/api/v1/uploads", uploadLimiter, uploadsRoutes);
app.use("/api/v1/artwork-preview", artworkPreviewRoutes);
app.use("/api/v1/quotes", publicQuoteLimiter, publicQuotesRoutes);
app.use("/api/v1/config/public", publicConfigRoutes);

app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use(
  "/api/v1/admin",
  adminWriteLimiter,
  requireStaffAuth,
  requireTrustedOrigin(allowedOrigins),
  adminRoutes,
);

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// 404 for anything unmatched under /api
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4001;

/**
 * Fail-fast startup (Production Hardening Patch §6/§13): config is
 * validated and the database connection is actually attempted *before*
 * the server ever calls listen() and starts accepting traffic. Previously
 * a missing/invalid DATABASE_URL let the process start successfully and
 * only surface the problem on the first real request (via errorHandler's
 * P1001 branch) — now a broken deploy never appears "up" in the first
 * place.
 */
async function start() {
  const { ok, errors } = validateConfig();
  if (!ok) {
    console.error("[startup] Refusing to start — invalid configuration:");
    errors.forEach((message) => console.error(`  - ${message}`));
    process.exit(1);
  }

  try {
    await prisma.$connect();
  } catch (err) {
    logSafeStartupError("Database connection", err);
    process.exit(1);
  }

  app.listen(PORT, () => console.log(`PrimeLinor API (catalog + leads/RFQ intake) running on port ${PORT}`));
}

if (require.main === module) {
  start();
}

module.exports = app;
