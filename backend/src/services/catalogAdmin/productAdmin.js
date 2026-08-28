/**
 * Product admin CRUD. Update strategy (Phase 5 §43): ONE PATCH endpoint
 * accepting a fully partial payload — the product editor's tabs each save
 * only the section they own (basics, pricing, colors, variants,
 * specifications, related products, tags). Any child-collection key
 * present in the request body (`priceTiers`, `colorIds`, `variants`,
 * `specifications`, `relatedProductIds`, `tagIds`) REPLACES that
 * collection wholesale inside one transaction — delete-then-recreate
 * rather than diffing against existing rows. This is simpler and more
 * predictable than a diff strategy (no "did the client mean to remove
 * this row or just not mention it" ambiguity) and matches how each tab
 * already holds its own complete list client-side. Assets and placement
 * zones are deliberately NOT part of this payload — they have their own
 * subresource endpoints (productAssetAdmin.js / placementZoneAdmin.js)
 * because they involve file-upload lifecycle that doesn't fit a
 * replace-the-whole-array transaction.
 */
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const solutionAdmin = require("./solutionAdmin");

// Product<->Category is many-to-many via ProductCategory (Solutions Phase
// 0) — `primaryCategory` is the canonical/breadcrumb category,
// `categories` is the full membership list (primary included), ordered so
// the primary reliably sorts first for admin display.
const CATEGORY_REF_SELECT = { id: true, slug: true, name: true, active: true };
const CATEGORIES_INCLUDE = {
  orderBy: { sortOrder: "asc" },
  include: { category: { select: CATEGORY_REF_SELECT } },
};

const ADMIN_LIST_INCLUDE = {
  primaryCategory: { select: CATEGORY_REF_SELECT },
  categories: CATEGORIES_INCLUDE,
  priceTiers: { select: { minQty: true, maxQty: true, unitPrice: true }, orderBy: { minQty: "asc" } },
  // Enough to run the canonical CATALOG→GALLERY_FRONT→first-active
  // priority (productImageSelection.js), not the full asset library
  // (Phase 5 §87 / Phase 6A.1 §30: avoid over-fetching on the list
  // endpoint). Was CATALOG-only before, which meant a product with only
  // GALLERY_FRONT photos showed no admin thumbnail at all.
  assets: {
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    take: 5,
    select: { type: true, url: true, alt: true, sortOrder: true },
  },
};

const ADMIN_DETAIL_INCLUDE = {
  primaryCategory: { select: CATEGORY_REF_SELECT },
  categories: CATEGORIES_INCLUDE,
  priceTiers: { orderBy: { minQty: "asc" } },
  colors: { include: { color: true }, orderBy: { sortOrder: "asc" } },
  variants: { orderBy: { sortOrder: "asc" } },
  specifications: { orderBy: { sortOrder: "asc" } },
  assets: { orderBy: { sortOrder: "asc" } },
  placementZones: { orderBy: { sortOrder: "asc" } },
  tags: { include: { tag: true } },
  relatedFrom: {
    orderBy: { sortOrder: "asc" },
    include: { relatedProduct: { select: { id: true, slug: true, name: true, active: true } } },
  },
  createdByUser: { select: { id: true, name: true } },
  updatedByUser: { select: { id: true, name: true } },
};

// primaryCategoryId/categoryIds are handled separately (see createProduct/
// updateProduct) since they need cross-field validation and a matching
// ProductCategory write, not a plain scalar column set.
const BASICS_KEYS = [
  "name",
  "slug",
  "description",
  "longSpec",
  "material",
  "gsm",
  "moq",
  "unit",
  "dispatchEstimate",
  "customizable",
  "active",
  "sortOrder",
  "variantType",
  "seoTitle",
  "seoDescription",
];

// ── Cross-field assertions (Phase 5 §45 — Zod covers per-field shape, this
// covers relationships Zod alone can't see: DB uniqueness, FK existence,
// tier math, self-reference) ─────────────────────────────────────────────

async function assertUniqueSlug(slug, excludeId) {
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw ApiError.conflict(`A product with slug "${slug}" already exists.`);
  }
}

/** All of categoryIds must exist, no duplicates — same shape as assertColorsValid/assertTagsValid. */
async function assertCategoriesValid(categoryIds) {
  if (new Set(categoryIds).size !== categoryIds.length) {
    throw ApiError.badRequest("Duplicate category in categoryIds.");
  }
  const rows = await prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, active: true } });
  if (rows.length !== categoryIds.length) throw ApiError.badRequest("One or more categories do not exist.");
  return rows;
}

/**
 * Pure — exported for unit testing without a database (see
 * assertTierCoversMoq precedent). `categoryRows` is [{id, active}] for the
 * product's EFFECTIVE category membership set (after this write). Solutions
 * Phase 0 §D: an active Product needs >=1 active category mapping, a
 * primaryCategoryId that's actually one of those mappings, and that
 * primary category must itself be active.
 */
function assertActiveCategoryInvariant(active, categoryRows, primaryCategoryId) {
  if (!active) return;
  if (!categoryRows.some((c) => c.active)) {
    throw ApiError.badRequest("Cannot activate a product with no active category mapping — map at least one active category.");
  }
  const primary = categoryRows.find((c) => c.id === primaryCategoryId);
  if (!primary) {
    throw ApiError.badRequest("primaryCategoryId must be one of the product's mapped categories.");
  }
  if (!primary.active) {
    throw ApiError.badRequest("The primary category must be active while the product is active.");
  }
}

async function assertColorsValid(colorIds) {
  if (new Set(colorIds).size !== colorIds.length) {
    throw ApiError.badRequest("Duplicate color in colorIds.");
  }
  const count = await prisma.color.count({ where: { id: { in: colorIds } } });
  if (count !== colorIds.length) throw ApiError.badRequest("One or more colors do not exist.");
}

function assertUniqueVariantCodes(variants) {
  const codes = variants.map((v) => v.code);
  if (new Set(codes).size !== codes.length) {
    throw ApiError.badRequest("Duplicate variant code.");
  }
}

async function assertRelatedProductsValid(productId, relatedProductIds) {
  if (relatedProductIds.includes(productId)) {
    throw ApiError.badRequest("A product cannot be related to itself.");
  }
  if (new Set(relatedProductIds).size !== relatedProductIds.length) {
    throw ApiError.badRequest("Duplicate product in relatedProductIds.");
  }
  const count = await prisma.product.count({ where: { id: { in: relatedProductIds } } });
  if (count !== relatedProductIds.length) throw ApiError.badRequest("One or more related products do not exist.");
}

async function assertTagsValid(tagIds) {
  if (new Set(tagIds).size !== tagIds.length) {
    throw ApiError.badRequest("Duplicate tag in tagIds.");
  }
  const count = await prisma.tag.count({ where: { id: { in: tagIds } } });
  if (count !== tagIds.length) throw ApiError.badRequest("One or more tags do not exist.");
}

/** The lowest tier must start at or below MOQ, or a customer at MOQ has no priced tier to buy at (Phase 5 §22). */
function assertTierCoversMoq(moq, tiers) {
  if (!tiers.length) return;
  const lowestMinQty = Math.min(...tiers.map((t) => t.minQty));
  if (lowestMinQty > moq) {
    throw ApiError.badRequest(`The lowest price tier (from qty ${lowestMinQty}) must cover the MOQ (${moq}).`);
  }
}

// ── Reads ────────────────────────────────────────────────────────────────────

function buildAdminWhere(query) {
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { slug: { contains: query.search, mode: "insensitive" } },
    ];
  }
  // Matches ANY category membership, not just the primary (Solutions Phase
  // 0 §H/§F) — consistent with the public products filter.
  if (query.category) where.categories = { some: { category: { slug: query.category } } };
  if (query.active !== undefined) where.active = query.active;
  if (query.priceMode) where.priceMode = query.priceMode;
  if (query.customizable !== undefined) where.customizable = query.customizable;
  return where;
}

function buildAdminOrderBy(sort) {
  if (sort === "updatedAt") return [{ updatedAt: "desc" }];
  if (sort === "name") return [{ name: "asc" }];
  return [{ sortOrder: "asc" }, { name: "asc" }];
}

async function listProductsAdmin(query) {
  const where = buildAdminWhere(query);
  const orderBy = buildAdminOrderBy(query.sort);
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      include: ADMIN_LIST_INCLUDE,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);
  return { products, total, page: query.page, limit: query.limit };
}

async function getProductAdmin(id) {
  const product = await prisma.product.findUnique({ where: { id }, include: ADMIN_DETAIL_INCLUDE });
  if (!product) throw ApiError.notFound("Product not found.");
  return product;
}

// ── Writes ───────────────────────────────────────────────────────────────────

async function createProduct(data, staffUser) {
  await assertUniqueSlug(data.slug);
  const categoryRows = await assertCategoriesValid(data.categoryIds);
  // Zod's checkPrimaryCategoryIncluded already caught this shape at the
  // HTTP boundary — re-checked here too since createProduct/updateProduct
  // are also called directly in tests/scripts that bypass Zod.
  if (!data.categoryIds.includes(data.primaryCategoryId)) {
    throw ApiError.badRequest("primaryCategoryId must be one of categoryIds.");
  }
  assertActiveCategoryInvariant(data.active ?? true, categoryRows, data.primaryCategoryId);
  if (data.priceMode === "TIERED" && data.priceTiers?.length) {
    assertTierCoversMoq(data.moq, data.priceTiers);
  }
  if (data.colorIds?.length) await assertColorsValid(data.colorIds.map((c) => c.colorId));
  if (data.variants?.length) assertUniqueVariantCodes(data.variants);
  if (data.relatedProductIds?.length) {
    // No productId to self-check against yet — a brand-new product can't
    // reference itself since its id doesn't exist until create() returns.
    const count = await prisma.product.count({ where: { id: { in: data.relatedProductIds } } });
    if (count !== new Set(data.relatedProductIds).size) throw ApiError.badRequest("One or more related products do not exist.");
    if (new Set(data.relatedProductIds).size !== data.relatedProductIds.length) {
      throw ApiError.badRequest("Duplicate product in relatedProductIds.");
    }
  }
  if (data.tagIds?.length) await assertTagsValid(data.tagIds);

  const newId = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        primaryCategoryId: data.primaryCategoryId,
        description: data.description,
        longSpec: data.longSpec ?? null,
        material: data.material ?? null,
        gsm: data.gsm ?? null,
        moq: data.moq,
        unit: data.unit,
        priceMode: data.priceMode,
        fixedPrice: data.priceMode === "FIXED" ? data.fixedPrice : null,
        quoteAboveQty: data.priceMode === "TIERED" ? data.quoteAboveQty ?? null : null,
        customizable: data.customizable ?? false,
        variantType: data.variantType ?? null,
        dispatchEstimate: data.dispatchEstimate ?? null,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        active: data.active ?? true,
        sortOrder: data.sortOrder ?? 0,
        createdByUserId: staffUser.id,
        updatedByUserId: staffUser.id,
      },
    });

    await tx.productCategory.createMany({
      data: data.categoryIds.map((categoryId, i) => ({ productId: created.id, categoryId, sortOrder: i })),
    });

    if (data.priceMode === "TIERED" && data.priceTiers?.length) {
      await tx.productPriceTier.createMany({
        data: data.priceTiers.map((t, i) => ({
          productId: created.id,
          minQty: t.minQty,
          maxQty: t.maxQty ?? null,
          unitPrice: t.unitPrice,
          sortOrder: t.sortOrder ?? i,
        })),
      });
    }
    if (data.colorIds?.length) {
      await tx.productColor.createMany({
        data: data.colorIds.map((c, i) => ({
          productId: created.id,
          colorId: c.colorId,
          active: c.active ?? true,
          sortOrder: c.sortOrder ?? i,
        })),
      });
    }
    if (data.variants?.length) {
      await tx.productVariant.createMany({
        data: data.variants.map((v, i) => ({
          productId: created.id,
          code: v.code,
          label: v.label,
          active: v.active ?? true,
          sortOrder: v.sortOrder ?? i,
        })),
      });
    }
    if (data.specifications?.length) {
      await tx.productSpecification.createMany({
        data: data.specifications.map((s, i) => ({
          productId: created.id,
          label: s.label,
          value: s.value,
          sortOrder: s.sortOrder ?? i,
        })),
      });
    }
    if (data.relatedProductIds?.length) {
      await tx.productRelated.createMany({
        data: data.relatedProductIds.map((rid, i) => ({ productId: created.id, relatedProductId: rid, sortOrder: i })),
      });
    }
    if (data.tagIds?.length) {
      await tx.productTag.createMany({ data: data.tagIds.map((tid) => ({ productId: created.id, tagId: tid })) });
    }

    return created.id;
  });

  return getProductAdmin(newId);
}

async function updateProduct(id, data, staffUser) {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { categories: { select: { categoryId: true } } },
  });
  if (!existing) throw ApiError.notFound("Product not found.");

  if (data.slug !== undefined && data.slug !== existing.slug) {
    await assertUniqueSlug(data.slug, id);
  }

  // Effective (post-write) category state — used both to validate
  // primaryCategoryId membership and the active-category invariant, since
  // either can be violated by a request that only touches ONE of
  // {active, primaryCategoryId, categoryIds} against the product's
  // EXISTING other values (Solutions Phase 0 §D).
  const effectivePrimaryCategoryId = data.primaryCategoryId !== undefined ? data.primaryCategoryId : existing.primaryCategoryId;
  const effectiveCategoryIds = data.categoryIds !== undefined ? data.categoryIds : existing.categories.map((c) => c.categoryId);

  let categoryRows = null;
  if (data.categoryIds !== undefined) {
    categoryRows = await assertCategoriesValid(data.categoryIds);
  }
  if (!effectiveCategoryIds.includes(effectivePrimaryCategoryId)) {
    throw ApiError.badRequest("primaryCategoryId must be one of the product's mapped categories.");
  }

  const effectiveActive = data.active !== undefined ? data.active : existing.active;
  if (effectiveActive) {
    const rowsForInvariant =
      categoryRows ?? (await prisma.category.findMany({ where: { id: { in: effectiveCategoryIds } }, select: { id: true, active: true } }));
    assertActiveCategoryInvariant(true, rowsForInvariant, effectivePrimaryCategoryId);
  }

  if (data.active === false && existing.active) {
    await solutionAdmin.assertProductDeactivationSafe(id);
  }

  const effectiveMoq = data.moq !== undefined ? data.moq : existing.moq;
  const effectivePriceMode = data.priceMode !== undefined ? data.priceMode : existing.priceMode;
  if (effectivePriceMode === "TIERED" && data.priceTiers !== undefined && data.priceTiers.length) {
    assertTierCoversMoq(effectiveMoq, data.priceTiers);
  }

  if (data.colorIds !== undefined && data.colorIds.length) {
    await assertColorsValid(data.colorIds.map((c) => c.colorId));
  }
  if (data.variants !== undefined) assertUniqueVariantCodes(data.variants);
  if (data.relatedProductIds !== undefined && data.relatedProductIds.length) {
    await assertRelatedProductsValid(id, data.relatedProductIds);
  }
  if (data.tagIds !== undefined && data.tagIds.length) await assertTagsValid(data.tagIds);

  await prisma.$transaction(async (tx) => {
    const basicsData = {};
    for (const key of BASICS_KEYS) {
      if (data[key] !== undefined) basicsData[key] = data[key];
    }
    if (data.priceMode !== undefined) {
      basicsData.priceMode = data.priceMode;
      basicsData.fixedPrice = data.priceMode === "FIXED" ? data.fixedPrice ?? null : null;
      basicsData.quoteAboveQty = data.priceMode === "TIERED" ? data.quoteAboveQty ?? null : null;
    } else {
      // priceMode untouched this request — still allow adjusting the
      // single scalar that matches the EXISTING mode without requiring
      // the whole pricing tab to resend priceMode every time.
      if (data.fixedPrice !== undefined && existing.priceMode === "FIXED") basicsData.fixedPrice = data.fixedPrice;
      if (data.quoteAboveQty !== undefined && existing.priceMode === "TIERED") basicsData.quoteAboveQty = data.quoteAboveQty;
    }
    if (data.primaryCategoryId !== undefined) basicsData.primaryCategoryId = data.primaryCategoryId;
    basicsData.updatedByUserId = staffUser.id;

    await tx.product.update({ where: { id }, data: basicsData });

    if (data.categoryIds !== undefined) {
      await tx.productCategory.deleteMany({ where: { productId: id } });
      await tx.productCategory.createMany({
        data: data.categoryIds.map((categoryId, i) => ({ productId: id, categoryId, sortOrder: i })),
      });
    }

    if (data.priceMode !== undefined || data.priceTiers !== undefined) {
      await tx.productPriceTier.deleteMany({ where: { productId: id } });
      const targetMode = data.priceMode ?? existing.priceMode;
      const tiers = data.priceTiers ?? [];
      if (targetMode === "TIERED" && tiers.length) {
        await tx.productPriceTier.createMany({
          data: tiers.map((t, i) => ({
            productId: id,
            minQty: t.minQty,
            maxQty: t.maxQty ?? null,
            unitPrice: t.unitPrice,
            sortOrder: t.sortOrder ?? i,
          })),
        });
      }
    }

    if (data.colorIds !== undefined) {
      await tx.productColor.deleteMany({ where: { productId: id } });
      if (data.colorIds.length) {
        await tx.productColor.createMany({
          data: data.colorIds.map((c, i) => ({
            productId: id,
            colorId: c.colorId,
            active: c.active ?? true,
            sortOrder: c.sortOrder ?? i,
          })),
        });
      }
    }
    if (data.variants !== undefined) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (data.variants.length) {
        await tx.productVariant.createMany({
          data: data.variants.map((v, i) => ({
            productId: id,
            code: v.code,
            label: v.label,
            active: v.active ?? true,
            sortOrder: v.sortOrder ?? i,
          })),
        });
      }
    }
    if (data.specifications !== undefined) {
      await tx.productSpecification.deleteMany({ where: { productId: id } });
      if (data.specifications.length) {
        await tx.productSpecification.createMany({
          data: data.specifications.map((s, i) => ({ productId: id, label: s.label, value: s.value, sortOrder: s.sortOrder ?? i })),
        });
      }
    }
    if (data.relatedProductIds !== undefined) {
      await tx.productRelated.deleteMany({ where: { productId: id } });
      if (data.relatedProductIds.length) {
        await tx.productRelated.createMany({
          data: data.relatedProductIds.map((rid, i) => ({ productId: id, relatedProductId: rid, sortOrder: i })),
        });
      }
    }
    if (data.tagIds !== undefined) {
      await tx.productTag.deleteMany({ where: { productId: id } });
      if (data.tagIds.length) {
        await tx.productTag.createMany({ data: data.tagIds.map((tid) => ({ productId: id, tagId: tid })) });
      }
    }
  });

  return getProductAdmin(id);
}

/**
 * Duplicate Product (Phase 5 §62): copies structural data (category, specs,
 * colors, variants, pricing, placement-zone STRUCTURE) into a new inactive
 * product. Deliberately does NOT copy assets (no automatic file
 * duplication) or related-product links (curated merchandising, not
 * structural product data) — the duplicate's placement zones are created
 * with colorId/assetId cleared since it has no images of its own yet.
 */
async function duplicateProduct(id, { slug: requestedSlug }, staffUser) {
  const original = await prisma.product.findUnique({
    where: { id },
    include: { priceTiers: true, colors: true, variants: true, specifications: true, tags: true, placementZones: true, categories: true },
  });
  if (!original) throw ApiError.notFound("Product not found.");

  const baseSlug = requestedSlug || `${original.slug}-copy`;
  let candidateSlug = baseSlug;
  let suffix = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.product.findUnique({ where: { slug: candidateSlug } })) {
    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const newId = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: `${original.name} (Copy)`,
        slug: candidateSlug,
        primaryCategoryId: original.primaryCategoryId,
        description: original.description,
        longSpec: original.longSpec,
        material: original.material,
        gsm: original.gsm,
        moq: original.moq,
        unit: original.unit,
        priceMode: original.priceMode,
        fixedPrice: original.fixedPrice,
        quoteAboveQty: original.quoteAboveQty,
        customizable: original.customizable,
        variantType: original.variantType,
        dispatchEstimate: original.dispatchEstimate,
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        active: false,
        sortOrder: original.sortOrder,
        createdByUserId: staffUser.id,
        updatedByUserId: staffUser.id,
      },
    });

    // Category memberships are structural (like colors/variants) — the
    // duplicate starts with the exact same category set, primary included.
    await tx.productCategory.createMany({
      data: original.categories.map((c) => ({ productId: created.id, categoryId: c.categoryId, sortOrder: c.sortOrder })),
    });

    if (original.priceTiers.length) {
      await tx.productPriceTier.createMany({
        data: original.priceTiers.map((t) => ({
          productId: created.id,
          minQty: t.minQty,
          maxQty: t.maxQty,
          unitPrice: t.unitPrice,
          sortOrder: t.sortOrder,
        })),
      });
    }
    if (original.colors.length) {
      await tx.productColor.createMany({
        data: original.colors.map((c) => ({ productId: created.id, colorId: c.colorId, active: c.active, sortOrder: c.sortOrder })),
      });
    }
    if (original.variants.length) {
      await tx.productVariant.createMany({
        data: original.variants.map((v) => ({ productId: created.id, code: v.code, label: v.label, active: v.active, sortOrder: v.sortOrder })),
      });
    }
    if (original.specifications.length) {
      await tx.productSpecification.createMany({
        data: original.specifications.map((s) => ({ productId: created.id, label: s.label, value: s.value, sortOrder: s.sortOrder })),
      });
    }
    if (original.placementZones.length) {
      await tx.placementZone.createMany({
        data: original.placementZones.map((z) => ({
          productId: created.id,
          view: z.view,
          placementKey: z.placementKey,
          label: z.label,
          cx: z.cx,
          cy: z.cy,
          width: z.width,
          height: z.height,
          active: z.active,
          sortOrder: z.sortOrder,
          colorId: null,
          assetId: null,
        })),
      });
    }
    if (original.tags.length) {
      await tx.productTag.createMany({ data: original.tags.map((t) => ({ productId: created.id, tagId: t.tagId })) });
    }

    return created.id;
  });

  return getProductAdmin(newId);
}

module.exports = {
  listProductsAdmin,
  getProductAdmin,
  createProduct,
  updateProduct,
  duplicateProduct,
  // Exported for unit testing without a database — see test/productAdminValidation.test.js
  assertTierCoversMoq,
  assertUniqueVariantCodes,
  assertActiveCategoryInvariant,
};
