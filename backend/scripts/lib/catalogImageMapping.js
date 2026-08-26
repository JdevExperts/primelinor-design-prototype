/**
 * Pure filename/slug helpers for scripts/uploadCatalogImages.js — kept
 * dependency-free (no DB, no fs, no S3) so the mapping logic is unit
 * testable in isolation from the actual upload run.
 */
const path = require("node:path");

const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

/**
 * Known filename→slug mismatches from the AI image batch, each verified
 * 1:1 against a real product name before being added here — this is a
 * fixed, auditable table, not fuzzy/speculative matching. Extend only
 * after confirming the target slug is unambiguous (exactly one candidate
 * product, no other file already claiming it).
 */
const SLUG_ALIASES = {
  "conference-gift-set": "conference-kit",
  "festival-gift-box-set": "festival-gift-box",
};

const FILENAME_RE = /^(.+)-catalog-(\d+)$/i;

/**
 * Parses `<slug>-catalog-<NN>.<ext>` into its parts. Returns
 * `{ ok: false, reason }` for anything that doesn't fit the convention —
 * callers report these as ignored/unmatched rather than guessing.
 */
function parseFilename(filename) {
  const rawExt = path.extname(filename);
  const ext = rawExt.toLowerCase();
  const base = path.basename(filename, rawExt);

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return { ok: false, reason: `unsupported extension "${ext || "(none)"}"` };
  }
  const match = FILENAME_RE.exec(base);
  if (!match) {
    return { ok: false, reason: `filename does not match "<slug>-catalog-<NN>${ext}" convention` };
  }
  return { ok: true, rawSlug: match[1].toLowerCase(), batchNumber: match[2], ext };
}

/**
 * Resolves a raw filename slug against the set of real product slugs —
 * exact match first, then the fixed alias table. Never fuzzy-matches: an
 * unresolved slug comes back `matchType: "unmatched"` with up to 3 nearest
 * known slugs (by simple prefix/substring overlap) for a human to review,
 * never auto-applied.
 */
function resolveSlug(rawSlug, knownSlugs) {
  if (knownSlugs.has(rawSlug)) {
    return { slug: rawSlug, matchType: "exact" };
  }
  const alias = SLUG_ALIASES[rawSlug];
  if (alias && knownSlugs.has(alias)) {
    return { slug: alias, matchType: "alias", aliasFrom: rawSlug };
  }
  return { slug: null, matchType: "unmatched", suggestions: nearestSlugs(rawSlug, knownSlugs) };
}

function nearestSlugs(rawSlug, knownSlugs, limit = 3) {
  const candidates = [...knownSlugs]
    .map((slug) => ({ slug, score: levenshtein(rawSlug, slug) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .filter((c) => c.score <= Math.max(4, Math.ceil(rawSlug.length * 0.4)));
  return candidates.map((c) => c.slug);
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** Mirrors storage/keys.js's sanitizeFileName so the suffix check in wasAlreadyUploaded() lines up with the real generated key. */
function sanitizeFileName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Idempotency check (§17): generateProductAssetKey() always writes
 * `products/<id>/<uuid>-<sanitizedBase><ext>` — the random uuid prefix
 * changes every run, but the sanitized original filename suffix doesn't,
 * so a suffix match on existing storageKeys reliably detects "this exact
 * source file was already uploaded for this product" across reruns.
 */
function wasAlreadyUploaded(existingAssets, originalFileName) {
  const ext = path.extname(originalFileName).toLowerCase();
  const base = sanitizeFileName(path.basename(originalFileName, ext));
  const suffix = `-${base}${ext}`;
  return (existingAssets || []).some((a) => a.storageKey && a.storageKey.endsWith(suffix));
}

module.exports = {
  SUPPORTED_EXTENSIONS,
  SLUG_ALIASES,
  parseFilename,
  resolveSlug,
  nearestSlugs,
  sanitizeFileName,
  wasAlreadyUploaded,
};
