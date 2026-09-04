/**
 * CORPORATE GIFTING — canonical-catalogue resolution.
 *
 * Corporate Gifting is a curated merchandising surface over the ONE Product
 * catalogue, not a second catalogue. These pure helpers turn the page's
 * curation config (plain slugs + merchandising copy) into real Product
 * records and real Category images fetched from the same public APIs the
 * Products listing and PDP use — so a product shown here is byte-for-byte
 * the same record, image, code and price as under the Products tab, and a
 * curated entry that no longer resolves (renamed / deactivated) is dropped
 * instead of rendering a broken card.
 *
 * No product name / image / price / MOQ / code is ever stored in the
 * gifting config; it only names *which* products to feature and in what
 * order.
 */

/** Index an array of listing-shape products by their slug (`product.id`). */
export function indexProductsBySlug(products) {
  const bySlug = new Map();
  for (const product of products || []) {
    if (product && product.id) bySlug.set(product.id, product);
  }
  return bySlug;
}

/**
 * Flatten the public `/categories` tree (parents + children) into a
 * `slug -> { url, alt }` map of the categories that actually have a
 * managed image. Fixture-mode categories (`{ id, label }` only) simply
 * contribute nothing, which the callers treat as "fall back to placeholder".
 */
export function indexCategoryImages(categories) {
  const bySlug = new Map();
  const visit = (node) => {
    if (!node) return;
    const slug = node.slug || node.id;
    if (slug && node.image && node.image.url) {
      bySlug.set(slug, { url: node.image.url, alt: node.image.alt || node.name || node.label || "" });
    }
    (node.children || []).forEach(visit);
  };
  (categories || []).forEach(visit);
  return bySlug;
}

/**
 * Resolve curated entries (`{ slug, ...merchandising }`) against the real
 * product index. Order is preserved; unknown slugs and inactive products
 * are skipped. Each result is the canonical listing-shape product with the
 * entry's merchandising fields merged alongside (never overriding catalogue
 * data).
 */
export function resolveGiftProducts(entries, productsBySlug) {
  const out = [];
  for (const entry of entries || []) {
    const slug = typeof entry === "string" ? entry : entry.slug;
    const product = productsBySlug.get(slug);
    if (!product || product.active === false) continue;
    out.push(typeof entry === "string" ? product : { ...product, gifting: entry });
  }
  return out;
}

/** One curated product by slug, or null when it can't be resolved safely. */
export function resolveGiftProduct(slug, productsBySlug) {
  const product = productsBySlug.get(slug);
  return product && product.active !== false ? product : null;
}

/**
 * Image for a "what are you gifting for?" / hero style block. `source` is
 * `{ kind: "category", slug }` or `{ kind: "product", slug }`. Returns
 * `{ url, alt }` or null (→ the component keeps its placeholder). Product
 * images reuse the exact primary image the Products listing resolves.
 */
export function resolveBlockImage(source, { productsBySlug, categoryImages }) {
  if (!source) return null;
  if (source.kind === "category") {
    return categoryImages.get(source.slug) || null;
  }
  if (source.kind === "product") {
    const product = productsBySlug.get(source.slug);
    if (product && product.active !== false && product.image) {
      return { url: product.image, alt: product.imageAlt || product.name || "" };
    }
  }
  return null;
}
