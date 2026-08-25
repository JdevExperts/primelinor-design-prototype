const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const productsRoutes = require("./src/routes/products.routes");
const categoriesRoutes = require("./src/routes/categories.routes");
const leadsRoutes = require("./src/routes/leads.routes");
const rfqsRoutes = require("./src/routes/rfqs.routes");
const uploadsRoutes = require("./src/routes/uploads.routes");
const artworkPreviewRoutes = require("./src/routes/artworkPreview.routes");
const errorHandler = require("./src/middleware/errorHandler");
const requestLogger = require("./src/middleware/requestLogger");

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
  }),
);

app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Customer-intake writes (Phase 2) get a much tighter limit than read
// traffic — one legitimate user submits a handful of enquiries per visit,
// never dozens per minute.
const writeLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10 });
const uploadLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });

app.use(express.json());
app.use(requestLogger);

app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/leads", writeLimiter, leadsRoutes);
app.use("/api/v1/rfqs", writeLimiter, rfqsRoutes);
app.use("/api/v1/uploads", uploadLimiter, uploadsRoutes);
app.use("/api/v1/artwork-preview", artworkPreviewRoutes);

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// 404 for anything unmatched under /api
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`PrimeLinor API (catalog + leads/RFQ intake) running on port ${PORT}`));

module.exports = app;
