const { z } = require("zod");
const { normalizeProductCode, PRODUCT_CODE_RE } = require("../services/productCode");

const SLUG_RE = /^[a-z0-9-]+$/;
const HEX_RE = /^#[0-9a-f]{6}$/i;
const PLACEMENT_KEY_RE = /^[a-z0-9-]+$/;
const ASSET_TYPES = [
  "CATALOG",
  "GALLERY_FRONT",
  "GALLERY_BACK",
  "DETAIL",
  "CUSTOMIZATION_FRONT",
  "CUSTOMIZATION_BACK",
  "MODEL",
  "TEAM",
  "LIFESTYLE",
];
const PLACEMENT_VIEWS = ["FRONT", "BACK"];
const PRICE_MODES = ["FIXED", "TIERED", "QUOTE_ONLY"];

const slug = z.string().trim().min(1).max(200).regex(SLUG_RE, "Use lowercase letters, numbers and hyphens only.");

// Product Code — normalized to uppercase/trimmed before the format check,
// so "pl-po-001" is accepted and stored as "PL-PO-001" (task §8/§22).
const productCode = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .transform(normalizeProductCode)
  .refine((value) => PRODUCT_CODE_RE.test(value), "Use the format PL-XX-001 (e.g. PL-PO-001).");
const uuid = z.string().uuid();
const idParamSchema = z.object({ id: uuid }).strict();
const productSubIdParamSchema = z.object({ id: uuid, assetId: uuid }).strict();
const productZoneIdParamSchema = z.object({ id: uuid, zoneId: uuid }).strict();

// ── Categories ───────────────────────────────────────────────────────────────

const categorySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    slug,
    parentCategoryId: uuid.nullable().optional(),
    active: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional(),
    // Editable here too (not just via the image upload endpoint) so an
    // admin can fix alt text alone without re-uploading the image.
    imageAlt: z.string().trim().max(300).nullable().optional(),
  })
  .strict();

const updateCategorySchema = categorySchema.partial().strict();

/** Multipart upload path — POST /admin/catalog/categories/:id/image. No `url` (set server-side after storing the file). */
const categoryImageMetaSchema = z.object({ alt: z.string().trim().max(300).nullable().optional() }).strict();

// ── Colors ───────────────────────────────────────────────────────────────────

const colorSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    slug,
    hex: z.string().regex(HEX_RE, "Use a 6-digit hex value, e.g. #1A2B3C.").nullable().optional(),
    active: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .strict();

const updateColorSchema = colorSchema.partial().strict();

// ── Tags ─────────────────────────────────────────────────────────────────────

const tagSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    slug,
  })
  .strict();

// ── Product sub-shapes (reused inside create/update) ────────────────────────

const priceTierInputSchema = z
  .object({
    minQty: z.coerce.number().int().positive(),
    maxQty: z.coerce.number().int().positive().nullable().optional(),
    unitPrice: z.coerce.number().positive(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .strict();

const colorAssignmentSchema = z
  .object({
    colorId: uuid,
    active: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .strict();

const variantInputSchema = z
  .object({
    code: z.string().trim().min(1).max(40),
    label: z.string().trim().min(1).max(80),
    active: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .strict();

const specificationInputSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    value: z.string().trim().min(1).max(300),
    sortOrder: z.coerce.number().int().optional(),
  })
  .strict();

const productBasicsFields = {
  name: z.string().trim().min(1).max(200),
  slug,
  productCode,
  // Product<->Category is many-to-many (Solutions Phase 0) — `categoryIds`
  // is the product's full category membership set, `primaryCategoryId`
  // must be one of them (checked in productAdmin.js, not expressible in
  // Zod alone since it's a cross-field relational rule). categoryIds is
  // required (min 1) on create; on update it's optional — omitting it
  // leaves the product's existing category memberships untouched, same
  // "only touch what this tab sent" convention as colorIds/tagIds/etc.
  primaryCategoryId: uuid,
  categoryIds: z.array(uuid).min(1).max(20),
  description: z.string().trim().min(1).max(2000),
  longSpec: z.string().trim().max(500).nullable().optional(),
  material: z.string().trim().max(80).nullable().optional(),
  gsm: z.coerce.number().int().positive().nullable().optional(),
  moq: z.coerce.number().int().positive(),
  unit: z.string().trim().min(1).max(40),
  dispatchEstimate: z.string().trim().max(80).nullable().optional(),
  customizable: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  variantType: z.string().trim().max(40).nullable().optional(),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  seoDescription: z.string().trim().max(300).nullable().optional(),
};

const pricingFields = {
  priceMode: z.enum(PRICE_MODES),
  fixedPrice: z.coerce.number().positive().nullable().optional(),
  priceTiers: z.array(priceTierInputSchema).max(20).optional(),
  quoteAboveQty: z.coerce.number().int().positive().nullable().optional(),
};

function checkPricingShape(data, ctx) {
  if (data.priceMode === "FIXED" && (data.fixedPrice === undefined || data.fixedPrice === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "fixedPrice is required for FIXED pricing.", path: ["fixedPrice"] });
  }
  if (data.priceMode === "TIERED" && (!data.priceTiers || data.priceTiers.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one price tier is required for TIERED pricing.", path: ["priceTiers"] });
  }
  if (data.priceMode !== "TIERED" && data.quoteAboveQty != null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "quoteAboveQty only applies to TIERED pricing.", path: ["quoteAboveQty"] });
  }
  if (data.priceTiers?.length) {
    const sorted = [...data.priceTiers].sort((a, b) => a.minQty - b.minQty);
    for (let i = 0; i < sorted.length; i += 1) {
      const tier = sorted[i];
      if (tier.maxQty != null && tier.maxQty < tier.minQty) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Tier starting at ${tier.minQty}: maxQty must be >= minQty.`, path: ["priceTiers"] });
      }
      if (i > 0) {
        const prevEnd = sorted[i - 1].maxQty ?? Infinity;
        if (tier.minQty <= prevEnd) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Tier starting at ${tier.minQty} overlaps the previous tier.`, path: ["priceTiers"] });
        }
      }
      if (i < sorted.length - 1 && tier.maxQty == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Only the last tier may be open-ended (no maxQty).", path: ["priceTiers"] });
      }
    }
    if (data.quoteAboveQty != null) {
      const last = sorted[sorted.length - 1];
      const coveredThrough = last.maxQty ?? Infinity;
      if (coveredThrough !== Infinity && data.quoteAboveQty < coveredThrough + 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "quoteAboveQty must be at or after the end of priced tier coverage.",
          path: ["quoteAboveQty"],
        });
      }
      if (coveredThrough === Infinity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "The last tier is open-ended, so quoteAboveQty can never apply — leave it blank or give the last tier a maxQty.",
          path: ["quoteAboveQty"],
        });
      }
    }
  }
}

// ── Create product ───────────────────────────────────────────────────────────
// Basics + pricing are required up front; colors/variants/specs/tags/related
// are optional at creation time (Phase 5 §44 — assets/placement zones are
// always separate subresource calls, since they involve file uploads).

/** primaryCategoryId must be one of categoryIds whenever both are present in this request (Solutions Phase 0 §E: "prevent removing the primary category without selecting another primary" starts here). */
function checkPrimaryCategoryIncluded(data, ctx) {
  if (data.primaryCategoryId !== undefined && data.categoryIds !== undefined && !data.categoryIds.includes(data.primaryCategoryId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "primaryCategoryId must be one of categoryIds.",
      path: ["primaryCategoryId"],
    });
  }
}

const createProductSchema = z
  .object({
    ...productBasicsFields,
    ...pricingFields,
    colorIds: z.array(colorAssignmentSchema).max(50).optional(),
    variants: z.array(variantInputSchema).max(50).optional(),
    specifications: z.array(specificationInputSchema).max(50).optional(),
    relatedProductIds: z.array(uuid).max(20).optional(),
    tagIds: z.array(uuid).max(30).optional(),
  })
  .strict()
  .superRefine(checkPricingShape)
  .superRefine(checkPrimaryCategoryIncluded);

// ── Update product ───────────────────────────────────────────────────────────
// Fully partial — a tab in the editor saves only the section it owns. Any
// child array key present REPLACES that child collection wholesale
// (predictable semantics; see productAdmin.js for why over a diff/patch
// strategy). `priceMode` presence is what triggers pricing-shape validation
// (a request touching only e.g. specifications never supplies it).

const updateProductSchema = z
  .object({
    ...Object.fromEntries(Object.entries(productBasicsFields).map(([k, v]) => [k, v.optional()])),
    ...Object.fromEntries(Object.entries(pricingFields).map(([k, v]) => [k, v.optional()])),
    colorIds: z.array(colorAssignmentSchema).max(50).optional(),
    variants: z.array(variantInputSchema).max(50).optional(),
    specifications: z.array(specificationInputSchema).max(50).optional(),
    relatedProductIds: z.array(uuid).max(20).optional(),
    tagIds: z.array(uuid).max(30).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.priceMode !== undefined) checkPricingShape(data, ctx);
  })
  .superRefine(checkPrimaryCategoryIncluded);

const duplicateProductSchema = z.object({ slug: slug.optional() }).strict();

// ── Product assets ───────────────────────────────────────────────────────────
// Two DIFFERENT creation shapes on two different endpoints (Phase 5 §29):
// a multipart upload (file on req.file, metadata as string form fields —
// coerced below) or a JSON body referencing an existing URL. They're kept
// as separate schemas/endpoints rather than one polymorphic one because
// the request content-type and field typing genuinely differ (form fields
// are always strings; JSON keeps real types), which would otherwise force
// a much fuzzier schema.

const assetMetaFields = {
  type: z.enum(ASSET_TYPES),
  colorId: uuid.nullable().optional(),
  alt: z.string().trim().max(200).nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
  active: z.union([z.boolean(), z.enum(["true", "false"])]).transform((v) => v === true || v === "true").optional(),
  supportsArtworkOverlay: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .optional(),
};

/** Multipart upload path — POST /products/:id/assets/upload. No `url` (set server-side after storing the file). */
const uploadAssetMetaSchema = z.object(assetMetaFields).strict();

/** Existing-URL reference path — POST /products/:id/assets. */
const createAssetFromUrlSchema = z
  .object({ ...assetMetaFields, url: z.string().trim().url().max(2000) })
  .strict()
  .refine((data) => /^https?:\/\//i.test(data.url), { message: "Only http/https URLs are allowed.", path: ["url"] });

const updateAssetSchema = z
  .object({
    type: z.enum(ASSET_TYPES).optional(),
    colorId: uuid.nullable().optional(),
    alt: z.string().trim().max(200).nullable().optional(),
    sortOrder: z.coerce.number().int().optional(),
    active: z.boolean().optional(),
    supportsArtworkOverlay: z.boolean().optional(),
  })
  .strict();

// ── Placement zones ──────────────────────────────────────────────────────────

const placementZoneSchema = z
  .object({
    view: z.enum(PLACEMENT_VIEWS),
    placementKey: z.string().trim().min(1).max(60).regex(PLACEMENT_KEY_RE, "Use lowercase letters, numbers and hyphens only."),
    label: z.string().trim().min(1).max(80),
    cx: z.coerce.number().min(0).max(100),
    cy: z.coerce.number().min(0).max(100),
    width: z.coerce.number().gt(0).max(100),
    height: z.coerce.number().gt(0).max(100),
    colorId: uuid.nullable().optional(),
    assetId: uuid.nullable().optional(),
    active: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .strict();

const updatePlacementZoneSchema = placementZoneSchema.partial().strict();

// ── Solutions ────────────────────────────────────────────────────────────────
// Rich per-page content (challenge points, benefits, process steps, feature
// blocks, final CTA) is stored as Json — validated here for shape so the
// Solution Admin's repeatable-row forms (never raw JSON, Solutions Phase A
// §15) always write something the frontend template components can render,
// without normalizing this content into its own relational tables.

const ctaLinkTarget = z.union([
  z.string().trim().min(1).max(300),
  z.object({ pathname: z.string().trim().min(1).max(300), hash: z.string().trim().max(100).optional() }).strict(),
]);

const finalCtaButtonSchema = z
  .object({
    type: z.enum(["quote", "link"]),
    label: z.string().trim().min(1).max(80),
    to: ctaLinkTarget.optional(),
  })
  .strict()
  .refine((data) => data.type !== "link" || data.to !== undefined, {
    message: "A link CTA requires `to`.",
    path: ["to"],
  });

const finalCtaSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    subtitle: z.string().trim().max(300).nullable().optional(),
    ctas: z.array(finalCtaButtonSchema).min(1).max(4),
  })
  .strict();

const titleDescriptionRowSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(400),
  })
  .strict();

const featureSectionSchema = z
  .object({
    id: z.string().trim().min(1).max(60).regex(SLUG_RE, "Use lowercase letters, numbers and hyphens only."),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(400),
    art: z.string().trim().max(40).nullable().optional(),
    color: z.string().regex(HEX_RE, "Use a 6-digit hex value, e.g. #1A2B3C.").nullable().optional(),
    ctaLabel: z.string().trim().max(80).nullable().optional(),
    ctaTo: z.string().trim().max(300).nullable().optional(),
  })
  .strict();

const solutionContentFields = {
  eyebrow: z.string().trim().max(80).nullable().optional(),
  hubDescription: z.string().trim().min(1).max(300),
  heroTitle: z.string().trim().min(1).max(160),
  heroCopy: z.string().trim().min(1).max(500),
  challengeTitle: z.string().trim().max(160).nullable().optional(),
  challengeCopy: z.string().trim().max(500).nullable().optional(),
  challengePoints: z.array(z.string().trim().min(1).max(200)).max(20).nullable().optional(),
  useCases: z.array(z.string().trim().min(1).max(120)).max(20).nullable().optional(),
  benefits: z.array(titleDescriptionRowSchema).max(12).nullable().optional(),
  processSteps: z.array(titleDescriptionRowSchema).max(12).nullable().optional(),
  featureSections: z.array(featureSectionSchema).max(6).nullable().optional(),
  finalCta: finalCtaSchema.nullable().optional(),
  primaryCtaLabel: z.string().trim().max(80).nullable().optional(),
  secondaryCtaLabel: z.string().trim().max(80).nullable().optional(),
  secondaryCtaTo: z.string().trim().max(300).nullable().optional(),
  proofTestimonialId: z.string().trim().max(60).nullable().optional(),
  art: z.string().trim().max(40).nullable().optional(),
  color: z.string().regex(HEX_RE, "Use a 6-digit hex value, e.g. #1A2B3C.").nullable().optional(),
};

const solutionBasicsFields = {
  name: z.string().trim().min(1).max(160),
  slug,
  active: z.boolean().optional(),
  featuredOnHome: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  homeSortOrder: z.coerce.number().int().optional(),
};

const createSolutionSchema = z
  .object({ ...solutionBasicsFields, ...solutionContentFields })
  .strict();

const updateSolutionSchema = z
  .object({
    ...Object.fromEntries(Object.entries(solutionBasicsFields).map(([k, v]) => [k, v.optional()])),
    ...Object.fromEntries(Object.entries(solutionContentFields).map(([k, v]) => [k, v.optional()])),
  })
  .strict();

/** Multipart upload path — POST /admin/catalog/solutions/:id/image. No `url` (set server-side after storing the file). */
const solutionImageMetaSchema = z.object({ alt: z.string().trim().max(300).nullable().optional() }).strict();

const solutionProductParamSchema = z.object({ id: uuid, productId: uuid }).strict();

const addSolutionProductSchema = z
  .object({ productId: uuid, sortOrder: z.coerce.number().int().optional(), featured: z.boolean().optional() })
  .strict();

const updateSolutionProductSchema = z
  .object({ sortOrder: z.coerce.number().int().optional(), featured: z.boolean().optional() })
  .strict();

// ── Admin list query ─────────────────────────────────────────────────────────

// A generic attribute key filter — UPPER_SNAKE_CASE machine key only, so
// the value can never become arbitrary filter/SQL input (§19).
const attributeKeySchema = z.string().trim().regex(/^[A-Z][A-Z0-9_]{1,63}$/);

const adminListProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(25),
    search: z.string().trim().min(1).max(200).optional(),
    category: z.string().trim().min(1).max(200).optional(),
    active: z.union([z.boolean(), z.enum(["true", "false"])]).transform((v) => v === true || v === "true").optional(),
    priceMode: z.enum(PRICE_MODES).optional(),
    customizable: z.union([z.boolean(), z.enum(["true", "false"])]).transform((v) => v === true || v === "true").optional(),
    // Generic product-attribute presence filters (Product Attribute
    // framework §14/§19) — e.g. hasAttribute=PRODUCT_REVIEW_PENDING.
    hasAttribute: attributeKeySchema.optional(),
    missingAttribute: attributeKeySchema.optional(),
    // Catalogue-health filters — same predicate the dashboard counts with.
    studioPending: z.enum(["1", "true"]).optional(),
    missingBackImage: z.enum(["1", "true"]).optional(),
    missingPrimaryImage: z.enum(["1", "true"]).optional(),
    missingColours: z.enum(["1", "true"]).optional(),
    sort: z.enum(["sortOrder", "updatedAt", "name"]).default("sortOrder"),
  })
  .strict();

const attributeKeyParamSchema = z.object({ id: z.string().uuid(), key: attributeKeySchema }).strict();
const productAttributeBodySchema = z.object({ value: z.any() }).strict();

module.exports = {
  idParamSchema,
  productSubIdParamSchema,
  productZoneIdParamSchema,
  categorySchema,
  updateCategorySchema,
  categoryImageMetaSchema,
  colorSchema,
  updateColorSchema,
  tagSchema,
  createProductSchema,
  updateProductSchema,
  duplicateProductSchema,
  variantInputSchema,
  uploadAssetMetaSchema,
  createAssetFromUrlSchema,
  updateAssetSchema,
  placementZoneSchema,
  updatePlacementZoneSchema,
  adminListProductsQuerySchema,
  attributeKeyParamSchema,
  productAttributeBodySchema,
  createSolutionSchema,
  updateSolutionSchema,
  solutionImageMetaSchema,
  solutionProductParamSchema,
  addSolutionProductSchema,
  updateSolutionProductSchema,
  ASSET_TYPES,
  PLACEMENT_VIEWS,
  PRICE_MODES,
};
