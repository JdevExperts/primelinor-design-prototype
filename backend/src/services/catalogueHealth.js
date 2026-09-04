/**
 * Catalogue Health (§28/§29). Every issue below is derived from a real
 * catalogue rule already in the schema/services — nothing invents missing
 * business data. The per-product rule evaluation is a pure function so it
 * can be unit-tested against fixtures; the DB function just loads the
 * minimum relations and tallies.
 */
const prisma = require("../lib/prisma");
const { isValidProductCode } = require("./productCode");
const { isStudioReady } = require("./studioReadiness");
const { REVIEW_PENDING_KEY, countProductsWithAttribute } = require("./productAttributeService");
const { PREDICATES } = require("./catalogHealthPredicates");

// Issue keys whose count + Admin Products filter share ONE predicate, so
// the dashboard number and the clicked list can never disagree (§11–§13).
const SHARED_PREDICATE_BY_ISSUE = {
  missingPrimaryImage: PREDICATES.missingPrimaryImage,
  noColours: PREDICATES.missingColours,
  customizableNotStudioReady: PREDICATES.studioPending,
  missingBackImage: PREDICATES.missingBackImage,
};

// severity: "error" = broken/missing required data · "attention" = worth a
// review but not broken · "info" = intentional configuration, not a problem.
const ISSUE_DEFS = {
  missingPrimaryImage: { severity: "error", definition: "Active product with no CATALOG-type image asset." },
  invalidProductCode: { severity: "error", definition: "Product Code missing or not matching PL-XX-000 format." },
  missingMoq: { severity: "error", definition: "Minimum order quantity is zero or unset." },
  missingPricing: {
    severity: "error",
    definition:
      "FIXED product without a fixed price, or TIERED product with no price tiers configured. QUOTE_ONLY (Price on Request) is a valid configuration and is NOT counted here.",
  },
  missingSpecs: {
    severity: "error",
    definition: "No specification rows and no long-spec/material text — not enough detail for a PDP.",
  },
  declaresVariantsButNoneDefined: {
    severity: "error",
    definition: "Product declares a variant type (e.g. size) but has no variants.",
  },
  noColours: { severity: "attention", definition: "Product has no colours configured — review whether it should." },
  categoryMismatch: {
    severity: "error",
    definition: "Product's category memberships don't include its own primary category.",
  },
  weakRelatedProducts: { severity: "attention", definition: "Fewer than 2 related products for cross-sell." },
  customizableNotStudioReady: {
    severity: "attention",
    label: "Customizable, Studio setup pending",
    definition: PREDICATES.studioPending.definition,
  },
  // Distinct from studioPending (§17) — a front-only Studio-ready tee still
  // lands here. Applicability is metadata-driven (size-typed / apparel-top
  // category / decorated), not product-name matching.
  missingBackImage: {
    severity: "attention",
    label: "Missing back image",
    definition: PREDICATES.missingBackImage.definition,
  },
};

/**
 * Count of active products intentionally on "Price on Request" (§11) —
 * commercial-attention info, never counted as a catalogue defect.
 */
function manualQuoteRequiredCount(products) {
  return (products || []).filter((p) => p.priceMode === "QUOTE_ONLY").length;
}

/** Review progress — no stored field (§22). */
function reviewProgress(totalProducts, pendingReview) {
  const total = Number(totalProducts) || 0;
  const pending = Math.min(Number(pendingReview) || 0, total);
  const reviewed = total - pending;
  return { totalProducts: total, pendingReview: pending, reviewed, progressPct: total ? Math.round((reviewed / total) * 100) : 0 };
}

/** @returns {string[]} issue keys for one active product with relations loaded. */
function evaluateProductHealth(p) {
  const issues = [];
  const assets = p.assets || [];
  if (!assets.some((a) => a.type === "CATALOG" && a.active !== false)) issues.push("missingPrimaryImage");
  if (!isValidProductCode(p.productCode)) issues.push("invalidProductCode");
  if (!p.moq || p.moq <= 0) issues.push("missingMoq");
  if (p.priceMode === "FIXED" && (p.fixedPrice == null || Number(p.fixedPrice) <= 0)) issues.push("missingPricing");
  if (p.priceMode === "TIERED" && (p.priceTiers || []).length === 0) issues.push("missingPricing");
  if (
    (p.specifications || []).length === 0 &&
    !String(p.longSpec || "").trim() &&
    !String(p.material || "").trim()
  ) {
    issues.push("missingSpecs");
  }
  if (String(p.variantType || "").trim() && (p.variants || []).length === 0) {
    issues.push("declaresVariantsButNoneDefined");
  }
  if ((p.colors || []).length === 0) issues.push("noColours");
  if (!(p.categories || []).some((c) => c.categoryId === p.primaryCategoryId)) issues.push("categoryMismatch");
  if ((p.relatedFrom || []).length < 2) issues.push("weakRelatedProducts");
  if (p.customizable && !isStudioReady(p)) issues.push("customizableNotStudioReady");
  return issues;
}

async function catalogueHealth() {
  const [products, activeCategories, activeSolutions, categoryCount, solutionCount] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        productCode: true,
        moq: true,
        priceMode: true,
        fixedPrice: true,
        longSpec: true,
        material: true,
        variantType: true,
        customizable: true,
        primaryCategoryId: true,
        primaryCategory: { select: { slug: true } },
        assets: { select: { type: true, active: true } },
        priceTiers: { select: { id: true } },
        specifications: { select: { id: true } },
        variants: { select: { id: true } },
        colors: { select: { id: true } },
        categories: { select: { categoryId: true } },
        relatedFrom: { select: { id: true } },
        placementZones: { select: { view: true } },
      },
    }),
    prisma.category.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        _count: { select: { primaryProducts: true, productMemberships: true } },
      },
    }),
    prisma.solution.findMany({
      where: { active: true },
      select: { id: true, name: true, _count: { select: { products: true } } },
    }),
    prisma.category.count(),
    prisma.solution.count(),
  ]);

  const issueCounts = Object.fromEntries(Object.keys(ISSUE_DEFS).map((k) => [k, 0]));
  const flaggedProductIds = new Set();
  for (const p of products) {
    for (const key of evaluateProductHealth(p)) {
      issueCounts[key] += 1;
      flaggedProductIds.add(p.id);
    }
    // missingBackImage isn't in evaluateProductHealth (it's shared-predicate
    // only) — tally it here for productsWithIssues.
    if (SHARED_PREDICATE_BY_ISSUE.missingBackImage.test(p)) {
      issueCounts.missingBackImage += 1;
      flaggedProductIds.add(p.id);
    }
  }

  // For every shared-predicate key, take the count from the SAME query the
  // Admin Products filter runs, so "dashboard says 7 → list shows 7" holds
  // by construction (§11–§13).
  await Promise.all(
    Object.entries(SHARED_PREDICATE_BY_ISSUE).map(async ([key, pred]) => {
      issueCounts[key] = await prisma.product.count({ where: { AND: [{ active: true }, pred.where] } });
    }),
  );

  const activeEmptyCategories = activeCategories.filter(
    (c) => c._count.primaryProducts === 0 && c._count.productMemberships === 0,
  ).length;
  const activeEmptySolutions = activeSolutions.filter((s) => s._count.products === 0).length;
  // Intentional "Price on Request" products — NOT a defect (§10/§11).
  const manualQuoteRequired = manualQuoteRequiredCount(products);

  const label = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim();

  const hrefFor = (key) => {
    const pred = SHARED_PREDICATE_BY_ISSUE[key];
    return pred
      ? `/admin/catalog/products?${pred.filterParam}=1&active=true`
      : "/admin/catalog/products";
  };

  const issues = Object.entries(ISSUE_DEFS).map(([key, def]) => ({
    key,
    label: def.label || label(key),
    definition: def.definition,
    severity: def.severity,
    count: issueCounts[key],
    href: hrefFor(key),
  }));
  issues.push({
    key: "activeEmptyCategory",
    label: "Active empty category",
    definition: "Active category with no products (primary or membership).",
    severity: "attention",
    count: activeEmptyCategories,
    href: "/admin/catalog/categories",
  });
  issues.push({
    key: "activeEmptySolution",
    label: "Active empty solution",
    definition: "Active solution with no mapped products.",
    severity: "attention",
    count: activeEmptySolutions,
    href: "/admin/catalog/solutions",
  });

  // Commercial-attention info row (§11) — kept separate from `issues` and
  // from `totalIssues` so a QUOTE_ONLY product is never called "broken".
  const commercial = [
    {
      key: "manualQuoteRequired",
      label: "Products Requiring Manual Quote",
      definition:
        "Products intentionally configured as Price on Request (QUOTE_ONLY). Sales must provide the rate during quotation preparation.",
      severity: "info",
      count: manualQuoteRequired,
      href: "/admin/catalog/products?priceMode=QUOTE_ONLY",
    },
  ];

  // Temporary catalogue-review workflow (Product Attribute framework
  // §17/§18) — counted directly from PRODUCT_REVIEW_PENDING presence, no
  // stored review status. Scoped to active products so it matches the
  // active-product total shown alongside it.
  const pendingReviewCount = await countProductsWithAttribute(REVIEW_PENDING_KEY, { activeOnly: true });
  const review = {
    ...reviewProgress(products.length, pendingReviewCount),
    pendingHref: `/admin/catalog/products?hasAttribute=${REVIEW_PENDING_KEY}`,
    completeHref: `/admin/catalog/products?missingAttribute=${REVIEW_PENDING_KEY}`,
  };

  return {
    totals: {
      activeProducts: products.length,
      categories: categoryCount,
      activeCategories: activeCategories.length,
      solutions: solutionCount,
      activeSolutions: activeSolutions.length,
    },
    productsWithIssues: flaggedProductIds.size,
    totalIssues: issues.reduce((a, b) => a + b.count, 0),
    issues,
    commercial,
    review,
  };
}

module.exports = {
  ISSUE_DEFS,
  SHARED_PREDICATE_BY_ISSUE,
  evaluateProductHealth,
  manualQuoteRequiredCount,
  reviewProgress,
  catalogueHealth,
};
