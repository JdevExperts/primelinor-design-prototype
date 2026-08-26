#!/usr/bin/env node
/**
 * AI catalogue image backfill — uploads locally-generated placeholder
 * catalogue photos (produced after the image-gap audit) to product-asset
 * storage and creates ONE `CATALOG` ProductAsset row per matched product,
 * for products that currently have no usable primary image.
 *
 * Deliberately reuses the existing Catalogue Admin upload path
 * (services/storage/productAssets + services/productAssetValidation +
 * services/productImageSelection) rather than a second ad-hoc S3
 * implementation — same key convention (`products/<product-id>/...`),
 * same magic-byte validation, same primary-image resolution rule.
 *
 * Six "Try Your Logo" Studio products are hard-excluded from ever being
 * auto-mapped here (see STUDIO_EXCLUDED_SLUGS) — those need calibrated
 * CUSTOMIZATION_FRONT/BACK photography with matching PlacementZone rows,
 * not a generic catalogue shot.
 *
 * Usage:
 *   node scripts/uploadCatalogImages.js --dir <path> --dry-run   # plan only, no S3/DB writes
 *   node scripts/uploadCatalogImages.js --dir <path>              # actually upload + write
 *
 * Safety: refuses outright in production, and requires an explicit opt-in
 * env var even in dev for a real (non-dry-run) write — mirrors
 * backfillLegacyCatalog.js's guard pattern exactly.
 */
const path = require("node:path");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const prisma = require("../src/lib/prisma");
const storage = require("../src/services/storage/productAssets");
const { validateUploadedProductImage } = require("../src/services/productAssetValidation");
const { selectPrimaryImage } = require("../src/services/productImageSelection");
const {
  SUPPORTED_EXTENSIONS,
  parseFilename,
  resolveSlug,
  wasAlreadyUploaded,
} = require("./lib/catalogImageMapping");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const dirFlagIndex = args.indexOf("--dir");
const IMAGE_DIR = dirFlagIndex !== -1 ? args[dirFlagIndex + 1] : null;

// "Try Your Logo" Studio products — never auto-mapped as a generic CATALOG
// image by this script (see module doc). If a source file targets one of
// these, it is reported separately and never uploaded/written.
const STUDIO_EXCLUDED_SLUGS = new Set([
  "cotton-round-neck",
  "premium-polo",
  "corporate-bottle",
  "canvas-tote",
  "welcome-kit",
  "biowash-round-neck-t-shirt",
]);

// The 20-product checklist from the image-gap audit — used only as a
// cross-check on the report, never as ground truth over the real DB/files.
const EXPECTED_SLUGS = [
  "drawstring-bag",
  "laptop-backpack",
  "vacuum-insulated-bottle",
  "classic-cap",
  "premium-cap",
  "conference-kit",
  "executive-gift-set",
  "festival-gift-box",
  "pullover-hoodie",
  "zipper-hoodie",
  "ceramic-mug",
  "a5-notebook-diary",
  "executive-notebook",
  "metal-pen",
  "plastic-promotional-pen",
  "event-essentials-kit",
  "promotional-merchandise-kit",
  "cotton-tote-bag",
  "sipper-tumbler",
  "corporate-staff-uniform-tshirt",
];

// ── Safety guards ────────────────────────────────────────────────────────────

function assertSafeToRun() {
  if (process.env.NODE_ENV === "production") {
    console.error("[catalog-images] Refusing to run: NODE_ENV=production. This script never runs against production.");
    process.exit(1);
  }
  if (!IMAGE_DIR) {
    console.error("[catalog-images] Missing required --dir <path> argument.");
    process.exit(1);
  }
  if (process.env.ALLOW_CATALOG_IMAGE_BACKFILL !== "true" && !DRY_RUN) {
    console.error(
      "[catalog-images] Refusing to run without explicit opt-in. Set ALLOW_CATALOG_IMAGE_BACKFILL=true to actually " +
        "upload + write, or pass --dry-run to preview the plan without touching S3 or the DB.",
    );
    process.exit(1);
  }
}

function printTargetEnvironment() {
  const raw = process.env.DATABASE_URL || "";
  let display = "(DATABASE_URL not set)";
  try {
    const u = new URL(raw);
    display = `${u.hostname}:${u.port || "5432"}${u.pathname}`;
  } catch {
    // leave the fallback message
  }
  console.log(`[catalog-images] NODE_ENV: ${process.env.NODE_ENV || "(unset)"}`);
  console.log(`[catalog-images] Target database: ${display}`);
  console.log(`[catalog-images] Storage backend: ${storage.isS3 ? "S3" : "local disk (no AWS_S3_BUCKET/credentials configured)"}`);
  console.log(`[catalog-images] Mode: ${DRY_RUN ? "DRY RUN — no S3 upload, no DB writes" : "LIVE — will upload + write"}`);
}

// ── Filesystem inspection ────────────────────────────────────────────────────

function walkImageDir(dir) {
  const batches = [];
  const topEntries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  const topFiles = topEntries.filter((e) => e.isFile());
  const topDirs = topEntries.filter((e) => e.isDirectory());

  const collect = (folder, batchLabel) => {
    const entries = fs.readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    const files = [];
    for (const entry of entries) {
      if (entry.isDirectory()) continue; // one level of batching only — matches the observed layout
      const ext = path.extname(entry.name).toLowerCase();
      if (entry.name.startsWith(".")) continue; // .DS_Store etc — silently ignored, not reported as unmatched
      files.push({
        filename: entry.name,
        fullPath: path.join(folder, entry.name),
        ext,
        isSupportedExt: SUPPORTED_EXTENSIONS.has(ext),
      });
    }
    return { batchLabel, folder, files };
  };

  if (topDirs.length > 0) {
    for (const d of topDirs) batches.push(collect(path.join(dir, d.name), d.name));
    if (topFiles.some((f) => !f.name.startsWith("."))) {
      batches.push(collect(dir, "(root — no batch folder)"));
    }
  } else {
    batches.push(collect(dir, "(root — no batch folder)"));
  }
  return batches;
}

function readDimensions(fullPath) {
  try {
    const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", fullPath], { encoding: "utf8" });
    const width = /pixelWidth:\s*(\d+)/.exec(out)?.[1];
    const height = /pixelHeight:\s*(\d+)/.exec(out)?.[1];
    if (!width || !height) return null;
    return { width: Number(width), height: Number(height) };
  } catch {
    return null; // dev-machine convenience only (macOS `sips`) — dimensions are informational, never a gate
  }
}

// ── DB matching ──────────────────────────────────────────────────────────────

async function loadProductIndex() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { slug: true, name: true } },
      assets: { select: { id: true, type: true, active: true, storageKey: true, url: true } },
    },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return { products, bySlug, knownSlugs: new Set(products.map((p) => p.slug)) };
}

// ── Plan building (shared by dry-run and live run) ───────────────────────────

function buildPlan(batches, productIndex) {
  const plan = [];
  const slugClaimedBy = new Map(); // slug -> filename, to detect same-run CONFLICTs

  for (const batch of batches) {
    for (const file of batch.files) {
      const row = { batch: batch.batchLabel, filename: file.filename, fullPath: file.fullPath };

      if (!file.isSupportedExt) {
        plan.push({ ...row, action: "IGNORED", reason: `unsupported/non-image extension "${file.ext || "(none)"}"` });
        continue;
      }

      const parsed = parseFilename(file.filename);
      if (!parsed.ok) {
        plan.push({ ...row, action: "UNMATCHED", reason: parsed.reason, suggestions: [] });
        continue;
      }

      const resolved = resolveSlug(parsed.rawSlug, productIndex.knownSlugs);
      if (resolved.matchType === "unmatched") {
        plan.push({ ...row, action: "UNMATCHED", reason: `no product with slug "${parsed.rawSlug}"`, suggestions: resolved.suggestions });
        continue;
      }

      const product = productIndex.bySlug.get(resolved.slug);
      row.slug = resolved.slug;
      row.matchType = resolved.matchType;
      row.aliasFrom = resolved.aliasFrom;
      row.productId = product.id;
      row.category = product.category?.slug;

      if (STUDIO_EXCLUDED_SLUGS.has(resolved.slug)) {
        plan.push({ ...row, action: "STUDIO_EXCLUDED", reason: "Studio/Try-Your-Logo product — requires calibrated customization photography, not a generic catalogue shot" });
        continue;
      }

      if (slugClaimedBy.has(resolved.slug)) {
        plan.push({ ...row, action: "CONFLICT", reason: `product already targeted in this run by "${slugClaimedBy.get(resolved.slug)}"` });
        continue;
      }

      if (!product.active) {
        plan.push({ ...row, action: "SKIP_INACTIVE_PRODUCT", reason: "matched product is not active" });
        continue;
      }

      let buffer;
      try {
        buffer = fs.readFileSync(file.fullPath);
      } catch (err) {
        plan.push({ ...row, action: "INVALID", reason: `could not read file: ${err.message}` });
        continue;
      }
      if (buffer.length === 0) {
        plan.push({ ...row, action: "INVALID", reason: "zero-byte file" });
        continue;
      }
      const validation = validateUploadedProductImage({ buffer, size: buffer.length });
      if (!validation.ok) {
        plan.push({ ...row, action: "INVALID", reason: validation.message });
        continue;
      }
      row.mimeType = validation.mimeType;
      row.fileSizeBytes = buffer.length;
      row.dimensions = readDimensions(file.fullPath);
      if (row.dimensions && row.dimensions.width !== row.dimensions.height) {
        row.aspectRatioFlag = `non-square (${row.dimensions.width}x${row.dimensions.height})`;
      }

      if (wasAlreadyUploaded(product.assets, file.filename)) {
        plan.push({ ...row, action: "SKIP_ALREADY_UPLOADED", reason: "a ProductAsset from this exact source file already exists (idempotent rerun)" });
        continue;
      }

      const existingPrimary = selectPrimaryImage(product.assets);
      if (existingPrimary) {
        plan.push({ ...row, action: "SKIP_EXISTING_PRIMARY", reason: `product already resolves a primary image (${existingPrimary.url})` });
        continue;
      }

      slugClaimedBy.set(resolved.slug, file.filename);
      plan.push({ ...row, action: "CREATE", buffer, reason: "no existing primary image — eligible for a new CATALOG asset" });
    }
  }
  return plan;
}

// ── Reporting ────────────────────────────────────────────────────────────────

function printPlanTable(plan) {
  console.log("\n[catalog-images] === DRY-RUN MAPPING TABLE ===");
  for (const row of plan) {
    console.log(`\n  file: ${row.batch} / ${row.filename}`);
    if (row.slug) console.log(`    -> slug: ${row.slug}${row.matchType === "alias" ? `  (alias of raw "${row.aliasFrom}")` : ""}`);
    if (row.productId) console.log(`    -> product id: ${row.productId}${row.category ? `  (category: ${row.category})` : ""}`);
    if (row.dimensions) console.log(`    -> dimensions: ${row.dimensions.width}x${row.dimensions.height}${row.aspectRatioFlag ? `  [FLAG: ${row.aspectRatioFlag}]` : ""}`);
    if (row.fileSizeBytes) console.log(`    -> size: ${(row.fileSizeBytes / 1024).toFixed(0)} KB, mime: ${row.mimeType}`);
    console.log(`    -> ProductAsset type: CATALOG`);
    console.log(`    -> action: ${row.action}${row.reason ? `  (${row.reason})` : ""}`);
    if (row.suggestions?.length) console.log(`    -> nearest known slugs: ${row.suggestions.join(", ")}`);
  }

  const counts = {};
  for (const row of plan) counts[row.action] = (counts[row.action] || 0) + 1;
  console.log("\n[catalog-images] === SUMMARY ===");
  for (const [action, n] of Object.entries(counts)) console.log(`  ${action}: ${n}`);

  const matchedSlugs = new Set(plan.filter((r) => r.slug).map((r) => r.slug));
  const missingExpected = EXPECTED_SLUGS.filter((s) => !matchedSlugs.has(s));
  if (missingExpected.length) {
    console.log(`\n[catalog-images] Expected slugs with NO matching file: ${missingExpected.join(", ")}`);
  } else {
    console.log("\n[catalog-images] All 20 expected checklist slugs have a matching file.");
  }
}

// ── Live execution ───────────────────────────────────────────────────────────

async function executeCreate(row) {
  const key = storage.generateProductAssetKey(row.productId, row.filename);
  await storage.putObject({ buffer: row.buffer, contentType: row.mimeType, key });
  const url = storage.buildPublicUrl(key);

  try {
    const asset = await prisma.productAsset.create({
      data: {
        productId: row.productId,
        type: "CATALOG",
        colorId: null,
        storageKey: key,
        url,
        alt: row.productName ? `${row.productName} catalogue image` : null,
        sortOrder: 0,
        active: true,
        supportsArtworkOverlay: false,
      },
    });
    return { ok: true, asset, key, url };
  } catch (err) {
    // Upload already succeeded — the object is orphaned (no DB row points
    // at it yet). Never silently lose track of it (§18).
    return { ok: false, orphanKey: key, orphanUrl: url, error: err.message };
  }
}

async function runLive(plan) {
  const creates = plan.filter((r) => r.action === "CREATE");
  console.log(`\n[catalog-images] === LIVE RUN: ${creates.length} product(s) to upload + write ===`);
  const results = [];
  for (const row of creates) {
    // Each product processed independently — one failure never aborts the rest (§18).
    try {
      const product = await prisma.product.findUnique({ where: { id: row.productId }, select: { name: true } });
      row.productName = product?.name;
      const result = await executeCreate(row);
      results.push({ ...row, ...result });
      if (result.ok) {
        console.log(`  [OK] ${row.filename} -> ${row.slug} (asset ${result.asset.id}, key ${result.key})`);
      } else {
        console.error(`  [DB FAILURE — ORPHAN OBJECT] ${row.filename} -> ${row.slug}: ${result.error}`);
        console.error(`    Orphan storage key (uploaded, not linked): ${result.orphanKey}`);
      }
    } catch (err) {
      console.error(`  [UPLOAD FAILURE] ${row.filename} -> ${row.slug}: ${err.message}`);
      results.push({ ...row, ok: false, error: err.message, stage: "upload" });
    }
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  assertSafeToRun();
  printTargetEnvironment();

  const batches = walkImageDir(IMAGE_DIR);
  console.log(`\n[catalog-images] Found ${batches.length} batch folder(s):`);
  for (const b of batches) console.log(`  - ${b.batchLabel}: ${b.files.length} file(s)`);

  const productIndex = await loadProductIndex();
  const plan = buildPlan(batches, productIndex);
  printPlanTable(plan);

  if (DRY_RUN) {
    console.log("\n[catalog-images] Dry run complete. No S3 upload, no DB writes performed.");
    return;
  }

  const results = await runLive(plan);
  const ok = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  console.log(`\n[catalog-images] Live run complete: ${ok.length} created, ${failed.length} failed.`);
  if (failed.length) {
    console.log("[catalog-images] Failures requiring manual review:");
    for (const f of failed) console.log(`  - ${f.filename} (${f.slug}): ${f.error}${f.orphanKey ? ` [orphan key: ${f.orphanKey}]` : ""}`);
  }
}

main()
  .catch((err) => {
    console.error("[catalog-images] Fatal error:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
