#!/usr/bin/env node
/**
 * Promotes the 20 AI-catalogue-image ProductAsset rows created by
 * scripts/uploadCatalogImages.js from local-disk dev storage to S3, now
 * that AWS credentials are configured. UPDATES the existing rows in place
 * (same id, same productId/type/colorId/alt/sortOrder/active) — never
 * creates a new ProductAsset, never touches a legacy/external asset, and
 * never touches the 6 Studio ("Try Your Logo") products.
 *
 * Reuses the exact same storage abstraction Catalogue Admin uses
 * (services/storage/productAssets) — once AWS_S3_BUCKET/credentials are
 * configured, that module automatically selects the real S3
 * implementation, so this script never talks to AWS directly.
 *
 * Usage:
 *   node scripts/promoteProductAssetsToS3.js --dry-run   # plan only, no S3/DB writes
 *   node scripts/promoteProductAssetsToS3.js              # actually upload + write
 *
 * Safety: refuses in production, requires an explicit opt-in env var for a
 * real (non-dry-run) write — same guard pattern as every other script in
 * this directory.
 */
const path = require("node:path");
const fs = require("node:fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const prisma = require("../src/lib/prisma");
const storage = require("../src/services/storage/productAssets");
const { validateUploadedProductImage } = require("../src/services/productAssetValidation");
const { hasObjectStorageConfigured } = require("../src/startup/validateConfig");
const { EXPECTED_PROMOTION_SLUGS, classifyAsset } = require("./lib/productAssetPromotion");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

// Mirrors productAssetLocal.js's STORAGE_ROOT exactly — this script needs
// to resolve the actual bytes behind an existing local storageKey, but
// deliberately doesn't import that module (it's the *destination* being
// migrated away from, not something this script should depend on).
const LOCAL_STORAGE_ROOT = path.join(__dirname, "../storage/products");

// ── Safety guards ────────────────────────────────────────────────────────────

function assertSafeToRun() {
  if (process.env.NODE_ENV === "production") {
    console.error("[promote-s3] Refusing to run: NODE_ENV=production. This script never runs against production.");
    process.exit(1);
  }
  if (process.env.ALLOW_PRODUCT_ASSET_S3_PROMOTION !== "true" && !DRY_RUN) {
    console.error(
      "[promote-s3] Refusing to run without explicit opt-in. Set ALLOW_PRODUCT_ASSET_S3_PROMOTION=true to actually " +
        "upload + write, or pass --dry-run to preview the plan without touching S3 or the DB.",
    );
    process.exit(1);
  }
}

function printTargetEnvironment() {
  const raw = process.env.DATABASE_URL || "";
  let dbDisplay = "(DATABASE_URL not set)";
  try {
    const u = new URL(raw);
    dbDisplay = `${u.hostname}:${u.port || "5432"}${u.pathname}`;
  } catch {
    // leave the fallback message
  }
  const s3Configured = hasObjectStorageConfigured(process.env);
  console.log(`[promote-s3] NODE_ENV: ${process.env.NODE_ENV || "(unset)"}`);
  console.log(`[promote-s3] Target database: ${dbDisplay}`);
  console.log(`[promote-s3] S3 configured: ${s3Configured}`);
  if (s3Configured) {
    console.log(`[promote-s3] S3 bucket: ${process.env.AWS_S3_BUCKET}`);
    console.log(`[promote-s3] S3 region: ${process.env.AWS_REGION || "ap-south-1"}`);
  }
  console.log(`[promote-s3] Storage backend selected by app: ${storage.isS3 ? "S3" : "local disk"}`);
  console.log(`[promote-s3] Mode: ${DRY_RUN ? "DRY RUN — no S3 upload, no DB writes" : "LIVE — will upload + write"}`);

  if (!s3Configured) {
    console.error("[promote-s3] Refusing to run: AWS_S3_BUCKET/AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are not fully configured.");
    process.exit(1);
  }
}

// ── Discovery ────────────────────────────────────────────────────────────────

async function loadCandidateAssets() {
  const products = await prisma.product.findMany({
    where: { slug: { in: [...EXPECTED_PROMOTION_SLUGS] } },
    include: { assets: true },
  });

  const rows = [];
  for (const product of products) {
    const catalogAssets = product.assets.filter((a) => a.type === "CATALOG" && a.active);
    if (catalogAssets.length === 0) {
      rows.push({ productSlug: product.slug, productId: product.id, action: "MISSING", reason: "no active CATALOG asset found for this product" });
      continue;
    }
    if (catalogAssets.length > 1) {
      rows.push({
        productSlug: product.slug,
        productId: product.id,
        action: "AMBIGUOUS",
        reason: `${catalogAssets.length} active CATALOG assets exist — refusing to guess which one to promote`,
        assetIds: catalogAssets.map((a) => a.id),
      });
      continue;
    }
    const asset = catalogAssets[0];
    const classification = classifyAsset({ productSlug: product.slug, asset });
    rows.push({
      productSlug: product.slug,
      productId: product.id,
      assetId: asset.id,
      currentUrl: asset.url,
      currentStorageKey: asset.storageKey,
      alt: asset.alt,
      ...classification,
    });
  }
  return rows;
}

function resolveLocalFile(storageKey) {
  const filePath = path.resolve(LOCAL_STORAGE_ROOT, storageKey);
  if (!filePath.startsWith(path.resolve(LOCAL_STORAGE_ROOT))) {
    return { ok: false, reason: "resolved path escapes local storage root — refusing" };
  }
  if (!fs.existsSync(filePath)) {
    return { ok: false, reason: `source file not found at ${filePath}` };
  }
  const buffer = fs.readFileSync(filePath);
  if (buffer.length === 0) {
    return { ok: false, reason: "zero-byte source file" };
  }
  const validation = validateUploadedProductImage({ buffer, size: buffer.length });
  if (!validation.ok) {
    return { ok: false, reason: validation.message };
  }
  return { ok: true, filePath, buffer, mimeType: validation.mimeType };
}

// ── Plan / dry-run ───────────────────────────────────────────────────────────

function buildPlan(rows) {
  return rows.map((row) => {
    if (row.action !== "PROMOTE") return row;

    const originalFileName = path.basename(row.currentStorageKey);
    const fileResult = resolveLocalFile(row.currentStorageKey);
    if (!fileResult.ok) {
      return { ...row, action: "SOURCE_MISSING", reason: fileResult.reason };
    }

    const proposedKey = storage.generateProductAssetKey(row.productId, originalFileName);
    const proposedUrl = storage.buildPublicUrl(proposedKey);
    return { ...row, sourceFilePath: fileResult.filePath, buffer: fileResult.buffer, mimeType: fileResult.mimeType, proposedKey, proposedUrl };
  });
}

function printPlanTable(plan) {
  console.log("\n[promote-s3] === DRY-RUN MAPPING TABLE ===");
  for (const row of plan) {
    console.log(`\n  product: ${row.productSlug} (${row.productId})`);
    if (row.assetId) console.log(`    -> ProductAsset id: ${row.assetId}`);
    if (row.currentUrl) console.log(`    -> current URL: ${row.currentUrl}`);
    if (row.currentStorageKey) console.log(`    -> current storageKey: ${row.currentStorageKey}`);
    if (row.sourceFilePath) console.log(`    -> source file: ${row.sourceFilePath}`);
    if (row.proposedKey) console.log(`    -> proposed S3 key: ${row.proposedKey}`);
    if (row.proposedUrl) console.log(`    -> proposed S3 URL: ${row.proposedUrl}`);
    console.log(`    -> action: ${row.action}  (${row.reason})`);
  }

  const counts = {};
  for (const row of plan) counts[row.action] = (counts[row.action] || 0) + 1;
  console.log("\n[promote-s3] === SUMMARY ===");
  for (const [action, n] of Object.entries(counts)) console.log(`  ${action}: ${n}`);
}

// ── Live execution ───────────────────────────────────────────────────────────

async function promoteOne(row) {
  await storage.putObject({ buffer: row.buffer, contentType: row.mimeType, key: row.proposedKey });

  // Read-back verification (§16/§28): the bucket serves product images
  // publicly (no ACL, bucket-policy-controlled — see s3Storage.js), so a
  // plain GET against the canonical URL is the same check a customer's
  // browser would perform, without adding a second S3 client/HEAD path to
  // the shared storage abstraction just for this one script.
  let verified = false;
  let verifyError = null;
  try {
    const res = await fetch(row.proposedUrl, { method: "GET" });
    verified = res.ok;
    if (!res.ok) verifyError = `GET ${row.proposedUrl} returned ${res.status}`;
  } catch (err) {
    verifyError = err.message;
  }
  if (!verified) {
    return { ok: false, stage: "verify", error: verifyError || "upload verification failed", orphanKey: row.proposedKey, orphanUrl: row.proposedUrl };
  }

  try {
    const updated = await prisma.productAsset.update({
      where: { id: row.assetId },
      data: { storageKey: row.proposedKey, url: row.proposedUrl },
    });
    return { ok: true, updated };
  } catch (err) {
    // S3 object is live and verified, but the DB row still points at local
    // disk — never silently lose track of this (§22).
    return { ok: false, stage: "db", error: err.message, orphanKey: row.proposedKey, orphanUrl: row.proposedUrl };
  }
}

async function runLive(plan) {
  const promotable = plan.filter((r) => r.action === "PROMOTE");
  console.log(`\n[promote-s3] === LIVE RUN: ${promotable.length} asset(s) to promote ===`);
  const results = [];
  for (const row of promotable) {
    try {
      const result = await promoteOne(row);
      results.push({ ...row, ...result });
      if (result.ok) {
        console.log(`  [OK] ${row.productSlug} -> ${row.proposedKey}`);
      } else {
        console.error(`  [FAILURE at ${result.stage}] ${row.productSlug}: ${result.error}`);
        if (result.orphanKey) console.error(`    Orphan S3 object (uploaded+verified, DB not updated): bucket=${process.env.AWS_S3_BUCKET} key=${result.orphanKey}`);
      }
    } catch (err) {
      console.error(`  [UNEXPECTED FAILURE] ${row.productSlug}: ${err.message}`);
      results.push({ ...row, ok: false, stage: "unexpected", error: err.message });
    }
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  assertSafeToRun();
  printTargetEnvironment();

  const candidateRows = await loadCandidateAssets();
  const plan = buildPlan(candidateRows);
  printPlanTable(plan);

  if (DRY_RUN) {
    console.log("\n[promote-s3] Dry run complete. No S3 upload, no DB writes performed.");
    return;
  }

  const results = await runLive(plan);
  const ok = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  console.log(`\n[promote-s3] Live run complete: ${ok.length} promoted, ${failed.length} failed.`);
  if (failed.length) {
    console.log("[promote-s3] Failures requiring manual review:");
    for (const f of failed) console.log(`  - ${f.productSlug}: ${f.error}${f.orphanKey ? ` [orphan key: ${f.orphanKey}]` : ""}`);
  }
}

main()
  .catch((err) => {
    console.error("[promote-s3] Fatal error:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
