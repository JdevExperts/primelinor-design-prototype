/**
 * Single source of truth for the Catalogue Health checks that also power
 * an Admin Products filter. Each entry pairs a Prisma `where` fragment
 * (used by BOTH the dashboard count and the products list filter, so they
 * can never disagree — §11/§12/§13) with a pure `test(product)` used for
 * the "N products with any issue" tally and for unit tests.
 *
 * `where` is always applied on top of `{ active: true }`.
 */
const { isStudioReady } = require("./studioReadiness");
const { isValidProductCode } = require("./productCode");

// Garment/apparel-top categories where a back view is meaningful. Category
// metadata, not product-name matching (§15).
const APPAREL_TOP_SLUGS = ["apparel", "tshirts", "polo", "hoodies", "uniforms", "jerseys", "sports"];
// Canonical back-side asset types (§16) — never a stray second CATALOG photo.
const BACK_ASSET_TYPES = ["GALLERY_BACK", "CUSTOMIZATION_BACK"];
const CUSTOMIZATION_ASSET_TYPES = ["CUSTOMIZATION_FRONT", "CUSTOMIZATION_BACK"];

/**
 * Is a back image relevant for this product? True when it is size-typed
 * apparel, sits in an apparel-top category, or has any customization
 * asset / placement zone (i.e. it is a decorated garment).
 */
function backImageApplicable(product) {
  if (!product) return false;
  if (product.variantType === "size") return true;
  const slug = product.primaryCategory?.slug || null;
  if (slug && APPAREL_TOP_SLUGS.includes(slug)) return true;
  if ((product.assets || []).some((a) => CUSTOMIZATION_ASSET_TYPES.includes(a.type))) return true;
  if ((product.placementZones || []).length > 0) return true;
  return false;
}

function hasBackImage(product) {
  return (product?.assets || []).some((a) => BACK_ASSET_TYPES.includes(a.type));
}

const APPLICABLE_WHERE = {
  OR: [
    { variantType: "size" },
    { primaryCategory: { slug: { in: APPAREL_TOP_SLUGS } } },
    { assets: { some: { type: { in: CUSTOMIZATION_ASSET_TYPES } } } },
    { placementZones: { some: {} } },
  ],
};

const PREDICATES = {
  // Customizable but not Studio-ready. Mirrors isStudioReady() exactly
  // (front customization asset AND a FRONT placement zone).
  studioPending: {
    filterParam: "studioPending",
    severity: "attention",
    label: "Customizable, Studio setup pending",
    definition:
      "Flagged customizable but missing the front customization asset and/or the front placement zone (studioReady = false).",
    where: {
      customizable: true,
      OR: [
        { assets: { none: { type: "CUSTOMIZATION_FRONT" } } },
        { placementZones: { none: { view: "FRONT" } } },
      ],
    },
    test: (p) => p.customizable === true && !isStudioReady(p),
  },

  // Apparel product with no canonical back-side image. Distinct from
  // studioPending (§17) — a front-only Studio-ready tee still lands here.
  missingBackImage: {
    filterParam: "missingBackImage",
    severity: "attention",
    label: "Missing back image",
    definition:
      "Apparel/garment product (size-typed, an apparel-top category, or decorated) with no GALLERY_BACK / CUSTOMIZATION_BACK asset.",
    where: {
      AND: [APPLICABLE_WHERE, { assets: { none: { type: { in: BACK_ASSET_TYPES } } } }],
    },
    test: (p) => backImageApplicable(p) && !hasBackImage(p),
  },

  // No active CATALOG (primary) image.
  missingPrimaryImage: {
    filterParam: "missingPrimaryImage",
    severity: "error",
    label: "Missing primary image",
    definition: "Active product with no active CATALOG-type image asset.",
    where: { assets: { none: { type: "CATALOG", active: true } } },
    test: (p) => !(p.assets || []).some((a) => a.type === "CATALOG" && a.active !== false),
  },

  // No colours configured.
  missingColours: {
    filterParam: "missingColours",
    severity: "attention",
    label: "No colours",
    definition: "Product has no colours configured — review whether it should.",
    where: { colors: { none: {} } },
    test: (p) => (p.colors || []).length === 0,
  },
};

/**
 * Informational per-product QA checklist for the Product editor (§25).
 * Purely derived — never stored. status: "ok" | "warn" | "na".
 * `product` must carry: productCode, moq, priceMode, fixedPrice,
 * priceTiers, longSpec, material, specifications, variantType, variants,
 * colors, categories, primaryCategoryId, relatedFrom, assets,
 * placementZones, customizable, primaryCategory{slug}.
 */
function qaChecklist(product) {
  if (!product) return [];
  const p = product;
  const has = (arr) => Array.isArray(arr) && arr.length > 0;
  const items = [];

  items.push({ key: "productCode", label: "Product Code", status: isValidProductCode(p.productCode) ? "ok" : "warn" });
  items.push({ key: "moq", label: "MOQ", status: p.moq && p.moq > 0 ? "ok" : "warn" });

  const pricingOk =
    p.priceMode === "QUOTE_ONLY" ||
    (p.priceMode === "FIXED" && p.fixedPrice != null && Number(p.fixedPrice) > 0) ||
    (p.priceMode === "TIERED" && has(p.priceTiers));
  items.push({ key: "pricing", label: "Pricing", status: pricingOk ? "ok" : "warn" });

  items.push({
    key: "primaryImage",
    label: "Primary Image",
    status: PREDICATES.missingPrimaryImage.test(p) ? "warn" : "ok",
  });

  items.push({
    key: "backImage",
    label: "Back Image",
    status: !backImageApplicable(p) ? "na" : hasBackImage(p) ? "ok" : "warn",
  });

  const specsOk = has(p.specifications) || String(p.longSpec || "").trim() || String(p.material || "").trim();
  items.push({ key: "specs", label: "Specs", status: specsOk ? "ok" : "warn" });

  items.push({
    key: "sizes",
    label: "Sizes",
    status: p.variantType === "size" ? (has(p.variants) ? "ok" : "warn") : "na",
  });

  items.push({ key: "colours", label: "Colours", status: has(p.colors) ? "ok" : "warn" });

  const categoryOk = (p.categories || []).some((c) => c.categoryId === p.primaryCategoryId);
  items.push({ key: "categories", label: "Categories", status: categoryOk ? "ok" : "warn" });

  items.push({
    key: "related",
    label: "Related Products",
    status: (p.relatedFrom || []).length >= 2 ? "ok" : "warn",
  });

  items.push({
    key: "studioReady",
    label: "Studio Readiness",
    status: !p.customizable ? "na" : isStudioReady(p) ? "ok" : "warn",
  });

  return items;
}

module.exports = {
  APPAREL_TOP_SLUGS,
  BACK_ASSET_TYPES,
  PREDICATES,
  backImageApplicable,
  hasBackImage,
  qaChecklist,
};
