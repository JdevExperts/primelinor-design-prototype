#!/usr/bin/env node
/**
 * Category-image backfill / replacement: local source files -> S3 ->
 * Category DB rows (imageUrl/imageStorageKey/imageAlt). Reads a local
 * directory only — never writes to it, never deletes source files
 * (they're user-owned).
 *
 * Change detection is content-hash based, not filename/timestamp based
 * (see scripts/lib/categoryImageBackfillPlan.js's decideActionFromHashes):
 * a category whose currently-live image hashes identically to the local
 * file is UNCHANGED and untouched; anything else is REPLACE'd under a
 * brand-new S3 key (never overwritten in place), verified publicly
 * reachable, THEN the DB row is updated, and only then is the previous
 * owned object deleted.
 *
 * Usage:
 *   node scripts/backfillCategoryImages.js --dir "<path>" --dry-run
 *   ALLOW_CATEGORY_IMAGE_BACKFILL=true node scripts/backfillCategoryImages.js --dir "<path>"
 *
 * Safety: refuses outright in production, and requires an explicit opt-in
 * env var even in dev for the real (non-dry-run) pass — this mutates the
 * catalogue's category rows and uploads to production-shared S3 storage,
 * not routine dev tooling.
 */
const path = require("node:path");
const fs = require("node:fs/promises");
const crypto = require("node:crypto");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const prisma = require("../src/lib/prisma");
const storage = require("../src/services/storage/categoryAssets");
const { validateUploadedProductImage } = require("../src/services/productAssetValidation");
const { readImageDimensions } = require("./lib/imageDimensions");
const { resolveCategorySlugForFile, TARGET_CATEGORY_SLUGS, DEFAULT_ALT_TEXT_BY_SLUG } = require("./lib/categoryImageMapping");
const { decideActionFromHashes, resolveDeleteKey } = require("./lib/categoryImageBackfillPlan");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const dirIndex = args.indexOf("--dir");
const SOURCE_DIR = dirIndex >= 0 ? args[dirIndex + 1] : null;

/**
 * Explicit, content-reviewed mapping for this replacement batch's actual
 * source files (generic ChatGPT export names carry no category-
 * identifying text — see categoryImageMapping.js's doc comment). This
 * batch's directory had TWO candidate Visiting Cards compositions
 * ("...02_27_53 PM (9).png" and "...(10).png") — (9) was the one
 * confirmed for use; (10) is deliberately left out of this map so it
 * reports UNMATCHED with a clear reason rather than silently uploading
 * both or guessing.
 */
const KNOWN_FILENAME_OVERRIDES = {
  "ChatGPT Image Aug 26, 2026, 02_27_49 PM (1).png": "tshirts",
  "ChatGPT Image Aug 26, 2026, 02_27_49 PM (2).png": "polo",
  "ChatGPT Image Aug 26, 2026, 02_27_50 PM (3).png": "bags",
  "ChatGPT Image Aug 26, 2026, 02_27_51 PM (4).png": "bottles",
  "ChatGPT Image Aug 26, 2026, 02_27_51 PM (5).png": "notebooks",
  "ChatGPT Image Aug 26, 2026, 02_27_52 PM (6).png": "promotional",
  "ChatGPT Image Aug 26, 2026, 02_27_52 PM (7).png": "corporate-gifts",
  "ChatGPT Image Aug 26, 2026, 02_27_53 PM (8).png": "kits",
  "ChatGPT Image Aug 26, 2026, 02_27_53 PM (9).png": "visiting-cards",
};

function assertSafeToRun() {
  if (process.env.NODE_ENV === "production") {
    console.error("[category-images] Refusing to run: NODE_ENV=production. This script never runs against production.");
    process.exit(1);
  }
  if (process.env.ALLOW_CATEGORY_IMAGE_BACKFILL !== "true" && !DRY_RUN) {
    console.error(
      "[category-images] Refusing to write without explicit opt-in. Set ALLOW_CATEGORY_IMAGE_BACKFILL=true to " +
        "actually upload/write, or pass --dry-run to preview the plan without writing anything.",
    );
    process.exit(1);
  }
}

function printEnvironmentReport() {
  const raw = process.env.DATABASE_URL || "";
  let dbDisplay = "(DATABASE_URL not set)";
  try {
    const u = new URL(raw);
    dbDisplay = `${u.hostname}:${u.port || "5432"}${u.pathname}`;
  } catch {
    // leave the fallback message
  }
  console.log("[category-images] Environment:");
  console.log(`  NODE_ENV:      ${process.env.NODE_ENV || "(unset)"}`);
  console.log(`  DB host/name:  ${dbDisplay}`);
  console.log(`  S3 bucket:     ${process.env.AWS_S3_BUCKET || "(not set — local disk fallback)"}`);
  console.log(`  S3 region:     ${process.env.AWS_REGION || "ap-south-1"}`);
  console.log(`  Storage impl:  ${storage.isS3 ? "S3" : "local disk"}`);
  console.log(`  Mode:          ${DRY_RUN ? "DRY RUN — no writes" : "LIVE — will upload and write"}`);
  console.log("");
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/** Fetches the currently-live image (if any) just to hash it for change detection — never written anywhere. */
async function hashRemoteUrl(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return sha256(buffer);
  } catch {
    return null;
  }
}

async function verifyPublicUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get("content-type"),
      contentLength: res.headers.get("content-length"),
    };
  } catch (err) {
    return { ok: false, status: null, error: err.message };
  }
}

async function main() {
  if (!SOURCE_DIR) {
    console.error('[category-images] Usage: node scripts/backfillCategoryImages.js --dir "<path>" [--dry-run] [--force]');
    process.exit(1);
  }

  assertSafeToRun();
  printEnvironmentReport();

  const entries = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && !e.name.startsWith(".")).map((e) => e.name).sort();

  if (!files.length) {
    console.log(`[category-images] No files found in ${SOURCE_DIR}`);
    return;
  }

  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const rows = [];
  const matchedSlugs = new Set();

  for (const filename of files) {
    const { slug, method, normalized } = resolveCategorySlugForFile(filename, { knownOverrides: KNOWN_FILENAME_OVERRIDES });

    if (!slug) {
      rows.push({ filename, normalized, category: null, action: "UNMATCHED", reason: "No canonical or known mapping for this filename." });
      continue;
    }

    const category = categoryBySlug.get(slug);
    if (!category) {
      rows.push({ filename, normalized, category: null, action: "UNMATCHED", reason: `Resolved to slug "${slug}" but no such Category exists.` });
      continue;
    }

    if (matchedSlugs.has(slug)) {
      rows.push({ filename, normalized, category, action: "UNMATCHED", reason: `A file for "${slug}" was already matched — not re-processing a second candidate.` });
      continue;
    }

    const filePath = path.join(SOURCE_DIR, filename);
    const buffer = await fs.readFile(filePath);
    const mockFile = { buffer, size: buffer.length, originalname: filename };
    const validation = validateUploadedProductImage(mockFile);
    if (!validation.ok) {
      rows.push({ filename, normalized, category, action: "UNMATCHED", reason: `Validation failed: ${validation.message}` });
      continue;
    }

    matchedSlugs.add(slug);
    const dimensions = readImageDimensions(buffer);
    const localHash = sha256(buffer);
    const remoteHash = await hashRemoteUrl(category.imageUrl);
    const action = decideActionFromHashes({ existingImageUrl: category.imageUrl, localHash, remoteHash, force: FORCE });

    rows.push({
      filename,
      normalized,
      method,
      category,
      buffer,
      mimeType: validation.mimeType,
      dimensions,
      localHash,
      remoteHash,
      action,
    });
  }

  for (const slug of TARGET_CATEGORY_SLUGS) {
    if (!matchedSlugs.has(slug)) {
      const category = categoryBySlug.get(slug);
      rows.push({ filename: "(none)", normalized: "(none)", category: category || null, action: "MISSING_LOCAL", reason: `No local source file maps to "${slug}".` });
    }
  }

  // ── Comparison table ─────────────────────────────────────────────────────
  console.log("[category-images] Comparison:");
  console.log(
    ["Category", "Source file", "Current image URL (tail)", "Source hash", "Live hash", "Action"].map((h) => h.padEnd(20)).join(" | "),
  );
  for (const row of rows) {
    const urlTail = row.category?.imageUrl ? row.category.imageUrl.split("/").slice(-1)[0].slice(0, 24) + "…" : "(none)";
    console.log(
      [
        row.category?.slug || "(unmatched)",
        row.filename.length > 34 ? row.filename.slice(0, 31) + "..." : row.filename,
        urlTail,
        row.localHash ? row.localHash.slice(0, 10) : "—",
        row.remoteHash ? row.remoteHash.slice(0, 10) : "—",
        row.action + (row.reason ? ` — ${row.reason}` : ""),
      ]
        .map((v) => String(v).padEnd(20))
        .join(" | "),
    );
  }
  console.log("");

  const replace = rows.filter((r) => r.action === "REPLACE");
  const unchanged = rows.filter((r) => r.action === "UNCHANGED");
  const missing = rows.filter((r) => r.action === "MISSING_LOCAL");
  const unmatched = rows.filter((r) => r.action === "UNMATCHED");

  console.log(`[category-images] Summary: ${replace.length} REPLACE, ${unchanged.length} UNCHANGED, ${missing.length} MISSING_LOCAL, ${unmatched.length} UNMATCHED.`);
  if (unmatched.length) {
    for (const row of unmatched) console.log(`  UNMATCHED: ${row.filename} — ${row.reason}`);
  }
  if (missing.length) {
    for (const row of missing) console.log(`  MISSING_LOCAL: ${row.reason}`);
  }
  console.log("");

  if (DRY_RUN) {
    console.log("[category-images] Dry run complete. No S3 writes, no DB writes.");
    return;
  }

  // ── Real upload/write pass ─────────────────────────────────────────────
  const results = [];
  for (const row of replace) {
    const key = storage.generateCategoryAssetKey(row.category.id, row.filename);
    await storage.putObject({ buffer: row.buffer, contentType: row.mimeType, key });
    const url = storage.buildPublicUrl(key);

    const verify = await verifyPublicUrl(url);
    if (!verify.ok) {
      console.error(`[category-images] Upload verification FAILED for ${row.category.slug}: ${JSON.stringify(verify)}`);
      console.error("[category-images] Aborting before any DB write for this file — object is in S3 but not linked.");
      process.exitCode = 1;
      continue;
    }

    const deleteKey = resolveDeleteKey({ previousStorageKey: row.category.imageStorageKey, newKey: key });
    const alt = DEFAULT_ALT_TEXT_BY_SLUG[row.category.slug] || row.category.imageAlt || row.category.name;

    await prisma.category.update({
      where: { id: row.category.id },
      data: { imageUrl: url, imageStorageKey: key, imageAlt: alt },
    });

    if (deleteKey) {
      await storage.deleteObject(deleteKey);
      console.log(`[category-images] REPLACE ${row.category.slug} — new object uploaded, DB updated, previous owned object deleted.`);
    } else {
      console.log(`[category-images] REPLACE ${row.category.slug} — ${url} (no previous owned object to delete)`);
    }

    results.push({ slug: row.category.slug, url, deletedOld: Boolean(deleteKey) });
  }

  for (const row of unchanged) {
    console.log(`[category-images] UNCHANGED ${row.category.slug} — content hash matches what's already live; nothing to do.`);
  }

  console.log("");
  console.log(
    `[category-images] Done. ${results.length} replaced, ${unchanged.length} unchanged, ${missing.length} missing local, ${unmatched.length} unmatched.`,
  );
}

main()
  .catch((err) => {
    console.error("[category-images] Failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
