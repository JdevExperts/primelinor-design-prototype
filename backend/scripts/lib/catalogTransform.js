/**
 * Pure legacy-row → new-schema transform functions (Phase 6A §11-25).
 * Deliberately side-effect-free and DB-free so they're unit-testable
 * without a database — see test/legacyCatalogTransform.test.js.
 */
const LEGACY_S3_BASE_URL = "https://pl-bulk.s3.ap-south-1.amazonaws.com";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resolves a unique slug against a Set of already-taken slugs, appending -2, -3, ... predictably on collision (§13). */
function resolveUniqueSlug(baseSlug, takenSlugs) {
  let candidate = baseSlug;
  let suffix = 2;
  while (takenSlugs.has(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

/** Light cleanup only — strip emoji/pictographs and collapse excess blank lines. Never rewrites content (§14/§15). */
function cleanDescription(text) {
  if (!text) return "";
  return text
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** "Cotton (100% Cotton)" → "100% cotton"; "Dry-Fit (Sports Polyester)" → "polyester" — a short, free-text material string matching the existing seed.js convention, not a fabric-marketing blurb. */
const FABRIC_NAME_TO_MATERIAL = {
  "Cotton (100% Cotton)": "100% cotton",
  "Bio-Wash Cotton": "bio-wash cotton",
  Polyester: "polyester",
  "Dry-Fit (Sports Polyester)": "polyester",
  "Cotton Blend (Poly-Cotton)": "poly-cotton",
  "Lycra / Stretchable": "cotton-lycra",
  "Terry Cotton": "terry cotton",
};

function materialFromFabricName(fabricName) {
  if (!fabricName) return null;
  return FABRIC_NAME_TO_MATERIAL[fabricName] || fabricName.toLowerCase();
}

/**
 * Legacy `pricing_slabs` rows (min_quantity/max_quantity/price_per_unit)
 * → new ProductPriceTier shape, sorted ascending. MOQ is the lowest
 * tier's minQty (§17: "prefer explicit minimum tier quantity" for
 * imported legacy products), not a placeholder.
 */
function pricingSlabsToTiers(slabs) {
  const sorted = [...slabs].sort((a, b) => Number(a.min_quantity) - Number(b.min_quantity));
  return {
    tiers: sorted.map((s, i) => ({
      minQty: Number(s.min_quantity),
      maxQty: s.max_quantity == null ? null : Number(s.max_quantity),
      unitPrice: Number(s.price_per_unit),
      sortOrder: i,
    })),
    moq: sorted.length ? Number(sorted[0].min_quantity) : null,
  };
}

/** `available_sizes` text[] → ProductVariant rows. Empty/missing array → [] (§21: never fabricate a default size run the source doesn't support). */
function sizesToVariants(sizes) {
  if (!sizes || !sizes.length) return [];
  return sizes.map((size, i) => ({ code: slugify(size), label: size, sortOrder: i }));
}

const KNOWN_PROTOCOLS = /^https?:\/\//i;
/** Obviously-local/dev paths a legacy dump should never carry into a new environment (§25). */
const SUSPICIOUS_LOCAL_PATTERNS = [/^file:\/\//i, /^\/?(localhost|127\.0\.0\.1)/i, /^[A-Za-z]:\\/];

/**
 * Legacy `image_url` values are either a full https URL (rare — a couple
 * of placehold.co placeholders) or a bare S3 object key with no host
 * (`images/products/<id>/<file>`, the overwhelming majority — see phase
 * report). Resolves the key form against the confirmed legacy production
 * bucket; rejects anything empty, malformed, or a local/dev path (§25).
 */
function resolveLegacyImageUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return { ok: false, reason: "empty URL" };
  const trimmed = rawUrl.trim();

  if (SUSPICIOUS_LOCAL_PATTERNS.some((re) => re.test(trimmed))) {
    return { ok: false, reason: "local/dev path, not a real storage reference" };
  }
  if (KNOWN_PROTOCOLS.test(trimmed)) {
    if (/placehold\.co/i.test(trimmed)) {
      return { ok: false, reason: "placeholder image (placehold.co), not a real product photo" };
    }
    return { ok: true, url: trimmed };
  }
  // Bare relative key — resolve against the confirmed legacy S3 bucket.
  const key = trimmed.replace(/^\/+/, "");
  if (!key || key.includes("..")) {
    return { ok: false, reason: "malformed storage key" };
  }
  return { ok: true, url: `${LEGACY_S3_BASE_URL}/${key}` };
}

module.exports = {
  LEGACY_S3_BASE_URL,
  slugify,
  resolveUniqueSlug,
  cleanDescription,
  materialFromFabricName,
  pricingSlabsToTiers,
  sizesToVariants,
  resolveLegacyImageUrl,
};
