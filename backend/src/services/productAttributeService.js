/**
 * Generic Product Attribute framework (see schema.prisma). One place for
 * every read/write of ProductAttributeConfig + ProductAttribute so
 * controllers never touch Prisma directly for this concern.
 *
 * Value validation is by the config's declared `valueType` — there is no
 * unvalidated "anything" write path.
 */
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");

const VALUE_TYPES = ["BOOLEAN", "STRING", "NUMBER", "JSON"];

// The single config this phase requires — a temporary catalogue-review
// flag. Row present ⇒ pending review; row absent ⇒ review complete.
const REVIEW_PENDING_KEY = "PRODUCT_REVIEW_PENDING";

// A machine key: UPPER_SNAKE_CASE, letters/digits/underscore only. Keeps
// the attribute filters to a safe, known shape (§19) — never arbitrary SQL.
const KEY_RE = /^[A-Z][A-Z0-9_]{1,63}$/;

function isValidAttributeKey(key) {
  return typeof key === "string" && KEY_RE.test(key);
}

/**
 * Validate a candidate value against a config's declared type. Returns the
 * value on success; throws ApiError.badRequest on mismatch.
 *
 *   BOOLEAN  → JS boolean            ("true"  → reject, true → ok)
 *   STRING   → JS string
 *   NUMBER   → finite JS number      ("12"    → reject, 12   → ok)
 *   JSON     → any JSON-serialisable value (object/array/scalar), not undefined
 */
function validateAttributeValue(config, value) {
  const type = config && config.valueType;
  switch (type) {
    case "BOOLEAN":
      if (typeof value !== "boolean") {
        throw ApiError.badRequest(`Attribute ${config.key} expects a boolean value.`);
      }
      return value;
    case "STRING":
      if (typeof value !== "string") {
        throw ApiError.badRequest(`Attribute ${config.key} expects a string value.`);
      }
      return value;
    case "NUMBER":
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw ApiError.badRequest(`Attribute ${config.key} expects a finite number.`);
      }
      return value;
    case "JSON": {
      if (value === undefined) throw ApiError.badRequest(`Attribute ${config.key} expects a JSON value.`);
      try {
        JSON.stringify(value);
      } catch {
        throw ApiError.badRequest(`Attribute ${config.key} value is not valid JSON.`);
      }
      return value;
    }
    default:
      throw ApiError.badRequest("Unknown attribute value type.");
  }
}

/** Pure: "PENDING" if any row matches `key`, else "COMPLETE". `rows` are
 *  ProductAttribute rows (with `.attribute.key`) or a plain key list. */
function reviewStatusFromAttributes(rows, key = REVIEW_PENDING_KEY) {
  const keys = (rows || []).map((r) => (typeof r === "string" ? r : r.attribute?.key || r.key));
  return keys.includes(key) ? "PENDING" : "COMPLETE";
}

/** Pure: the Prisma `where` fragment for hasAttribute / missingAttribute (§19). */
function buildAttributeWhere({ hasAttribute, missingAttribute } = {}) {
  const and = [];
  if (hasAttribute && isValidAttributeKey(hasAttribute)) {
    and.push({ productAttributes: { some: { attribute: { key: hasAttribute } } } });
  }
  if (missingAttribute && isValidAttributeKey(missingAttribute)) {
    and.push({ productAttributes: { none: { attribute: { key: missingAttribute } } } });
  }
  return and.length ? { AND: and } : {};
}

// ── DB reads ─────────────────────────────────────────────────────────────

async function getConfigByKey(key, { required = true } = {}) {
  const config = await prisma.productAttributeConfig.findUnique({ where: { key } });
  if (!config && required) throw ApiError.notFound(`Attribute config "${key}" not found.`);
  return config;
}

async function listConfigs() {
  return prisma.productAttributeConfig.findMany({ orderBy: { key: "asc" } });
}

async function getProductAttribute(productId, key) {
  const config = await getConfigByKey(key);
  return prisma.productAttribute.findUnique({
    where: { productId_attributeId: { productId, attributeId: config.id } },
    include: { attribute: { select: { key: true, name: true, valueType: true } } },
  });
}

async function hasProductAttribute(productId, key) {
  return Boolean(await getProductAttribute(productId, key));
}

/** Product ids that currently carry attribute `key` (batch helper for lists). */
async function productIdsWithAttribute(key) {
  const rows = await prisma.productAttribute.findMany({
    where: { attribute: { key } },
    select: { productId: true },
  });
  return new Set(rows.map((r) => r.productId));
}

async function countProductsWithAttribute(key, { activeOnly = false } = {}) {
  return prisma.product.count({
    where: {
      ...(activeOnly ? { active: true } : {}),
      productAttributes: { some: { attribute: { key } } },
    },
  });
}

// ── DB writes (ADMIN-gated at the route) ────────────────────────────────

async function upsertProductAttribute(productId, key, value) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw ApiError.notFound("Product not found.");
  const config = await getConfigByKey(key);
  validateAttributeValue(config, value);
  return prisma.productAttribute.upsert({
    where: { productId_attributeId: { productId, attributeId: config.id } },
    create: { productId, attributeId: config.id, value },
    update: { value },
    include: { attribute: { select: { key: true, name: true, valueType: true } } },
  });
}

/** Idempotent — no error if the row is already absent (§11 semantics). */
async function removeProductAttribute(productId, key) {
  const config = await getConfigByKey(key);
  const { count } = await prisma.productAttribute.deleteMany({ where: { productId, attributeId: config.id } });
  return { removed: count > 0 };
}

/**
 * Assign `key = value` to every product that doesn't already have it.
 * Idempotent (relies on the (product,attr) unique index). Returns how many
 * rows it added.
 */
async function backfillProductAttribute(key, value) {
  const config = await getConfigByKey(key);
  validateAttributeValue(config, value);
  const missing = await prisma.product.findMany({
    where: { productAttributes: { none: { attributeId: config.id } } },
    select: { id: true },
  });
  if (!missing.length) return { added: 0 };
  const { count } = await prisma.productAttribute.createMany({
    data: missing.map((p) => ({ productId: p.id, attributeId: config.id, value })),
    skipDuplicates: true,
  });
  return { added: count };
}

module.exports = {
  VALUE_TYPES,
  REVIEW_PENDING_KEY,
  KEY_RE,
  isValidAttributeKey,
  validateAttributeValue,
  reviewStatusFromAttributes,
  buildAttributeWhere,
  getConfigByKey,
  listConfigs,
  getProductAttribute,
  hasProductAttribute,
  productIdsWithAttribute,
  countProductsWithAttribute,
  upsertProductAttribute,
  removeProductAttribute,
  backfillProductAttribute,
};
