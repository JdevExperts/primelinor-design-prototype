const path = require("node:path");

/**
 * Canonical filename → real backend Category slug, per the task brief's
 * numbered list. Files matching this (after normalization) never need a
 * manual override — this is what makes future re-drops of correctly named
 * files "just work" with zero code changes.
 */
const CANONICAL_FILENAME_TO_SLUG = {
  "tshirts-category.webp": "tshirts",
  "polo-category.webp": "polo",
  "bags-category.webp": "bags",
  "bottles-category.webp": "bottles",
  "notebooks-category.webp": "notebooks",
  "promotional-category.webp": "promotional",
  "corporate-gifts-category.webp": "corporate-gifts",
  "gift-kits-category.webp": "kits",
  "visiting-cards-category.webp": "visiting-cards",
};

/**
 * Strips OS/browser duplicate-download suffixes — " (1)", " (2)", etc —
 * immediately before the extension, then lowercases. Per the task brief:
 * these suffixes are never category identity, sort order, or otherwise
 * meaningful — they only mean "a file with this name already existed in
 * the download folder."
 */
function normalizeDownloadFilename(filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const stripped = base.replace(/ \(\d+\)$/, "");
  return `${stripped}${ext}`.toLowerCase();
}

/**
 * Resolves a source filename to a category slug two ways: (1) canonical
 * filename matching after normalization — the general-purpose, no-code-
 * change path for correctly named files; (2) an explicit, content-
 * reviewed `knownOverrides` map (filename → slug) for source files that
 * don't carry canonical names at all — this backfill's real files are
 * generic export names ("ChatGPT Image Aug 26, 2026, 12_54_20 PM (1).png")
 * with zero category-identifying text, so canonical matching alone finds
 * nothing for them; the mapping was instead confirmed by viewing each
 * image (see the completion report). A file matching neither is
 * UNMATCHED — never guessed from file order alone.
 */
function resolveCategorySlugForFile(filename, { knownOverrides = {} } = {}) {
  const normalized = normalizeDownloadFilename(filename);
  const canonicalSlug = CANONICAL_FILENAME_TO_SLUG[normalized];
  if (canonicalSlug) return { slug: canonicalSlug, method: "canonical-filename", normalized };
  if (knownOverrides[filename]) return { slug: knownOverrides[filename], method: "known-file-override", normalized };
  return { slug: null, method: null, normalized };
}

/** The complete set of category slugs this backfill manages — a target slug with no matching local file is MISSING_LOCAL, not silently skipped. */
const TARGET_CATEGORY_SLUGS = Object.values(CANONICAL_FILENAME_TO_SLUG);

/** Clean, customer-facing, brand-neutral alt text — never mentions AI or any specific (real or placeholder) brand shown in the source photo. */
const DEFAULT_ALT_TEXT_BY_SLUG = {
  tshirts: "Custom T-shirts",
  polo: "Corporate polo T-shirts",
  bags: "Custom bags and backpacks",
  bottles: "Corporate bottles and drinkware",
  notebooks: "Corporate notebooks and diaries",
  promotional: "Promotional products",
  "corporate-gifts": "Corporate gifts",
  kits: "Corporate gift kits",
  "visiting-cards": "Printed visiting cards",
};

module.exports = {
  CANONICAL_FILENAME_TO_SLUG,
  TARGET_CATEGORY_SLUGS,
  DEFAULT_ALT_TEXT_BY_SLUG,
  normalizeDownloadFilename,
  resolveCategorySlugForFile,
};
