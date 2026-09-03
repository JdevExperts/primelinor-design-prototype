const test = require("node:test");
const assert = require("node:assert/strict");

const {
  PRODUCT_CODE_RE,
  normalizeProductCode,
  isValidProductCode,
  productCodeFamily,
} = require("../src/services/productCode");
const { PRODUCT_CODE_BY_SLUG } = require("../prisma/productCodeMap");
const { createProductSchema, updateProductSchema, variantInputSchema } = require("../src/validation/adminCatalog.schema");
const { buildWhere } = require("../src/controllers/products.controller");
const { buildAdminWhere } = require("../src/services/catalogAdmin/productAdmin");
const { buildQuoteView } = require("../src/services/quotePdf");

const BASE_PRODUCT = {
  name: "Test Product",
  slug: "test-product",
  productCode: "PL-TS-900",
  primaryCategoryId: "11111111-1111-4111-8111-111111111111",
  categoryIds: ["11111111-1111-4111-8111-111111111111"],
  description: "A test product.",
  moq: 10,
  unit: "piece",
  priceMode: "QUOTE_ONLY",
};

// ── Format / normalization (task §28 B, §22) ─────────────────────────────

test("PRODUCT_CODE_RE: accepts PL-XX-NNN, rejects malformed codes", () => {
  for (const good of ["PL-PO-001", "PL-TS-046", "PL-GK-999", "PL-PO-0001"]) {
    assert.ok(PRODUCT_CODE_RE.test(good), good);
  }
  for (const bad of ["pl-po-001", "PL-P-001", "PL-POL-001", "PLPO001", "PL-PO-1", "PL-PO-12", "PL-PO-ABC", "SKU-PO-001", "PL-PO-00001"]) {
    assert.ok(!PRODUCT_CODE_RE.test(bad), bad);
  }
});

test("normalizeProductCode: uppercases, trims and strips spaces", () => {
  assert.equal(normalizeProductCode("  pl-po-001 "), "PL-PO-001");
  assert.equal(normalizeProductCode("pl - po - 001"), "PL-PO-001");
  assert.equal(normalizeProductCode("PL-PO-001"), "PL-PO-001");
});

test("createProductSchema: normalizes a lowercase productCode to uppercase (task §28 B)", () => {
  const result = createProductSchema.safeParse({ ...BASE_PRODUCT, productCode: "pl-po-001" });
  assert.ok(result.success, JSON.stringify(result.error?.issues));
  assert.equal(result.data.productCode, "PL-PO-001");
});

test("createProductSchema: rejects a productCode that isn't PL-XX-NNN", () => {
  const result = createProductSchema.safeParse({ ...BASE_PRODUCT, productCode: "POLO-1" });
  assert.equal(result.success, false);
});

test("createProductSchema: productCode is required on create", () => {
  const { productCode, ...withoutCode } = BASE_PRODUCT;
  assert.equal(createProductSchema.safeParse(withoutCode).success, false);
});

// ── Product Code belongs to Product, never a variant/colour (task §28 C/D) ──

test("updateProductSchema: a size/variant-only edit never carries a productCode", () => {
  const result = updateProductSchema.safeParse({
    variants: [
      { code: "S", label: "Small", sortOrder: 0 },
      { code: "M", label: "Medium", sortOrder: 1 },
    ],
  });
  assert.ok(result.success);
  assert.equal("productCode" in result.data, false);
});

test("variantInputSchema: has no productCode field — a variant can't declare its own code", () => {
  const result = variantInputSchema.safeParse({ code: "S", label: "Small", productCode: "PL-PO-002" });
  assert.equal(result.success, false); // .strict() rejects the unknown key
});

// ── Search wiring (task §28 E/F/G) ─────────────────────────────────────

test("public buildWhere: a search term matches name, slug OR productCode (case-insensitive)", () => {
  const where = buildWhere({ search: "pl-po-001" });
  const fields = where.OR.map((clause) => Object.keys(clause)[0]);
  assert.deepEqual(fields.sort(), ["name", "productCode", "slug"]);
  const codeClause = where.OR.find((c) => c.productCode);
  assert.equal(codeClause.productCode.mode, "insensitive");
  assert.equal(codeClause.productCode.contains, "pl-po-001");
});

test("admin buildAdminWhere: search also covers productCode", () => {
  const where = buildAdminWhere({ search: "PO-001" });
  assert.ok(where.OR.some((c) => c.productCode?.contains === "PO-001" && c.productCode.mode === "insensitive"));
});

// ── PDF view carries the code, unchanged by colour/size (task §28 J) ─────

test("buildQuoteView: each line exposes its frozen Product Code for the PDF", () => {
  const view = buildQuoteView({
    reference: "PL-RQ-2026-000030-V1",
    customer: { name: "Jdev" },
    currency: "INR",
    createdAt: new Date("2026-09-02"),
    validUntil: new Date("2026-09-09"),
    subtotal: 25000,
    grandTotal: 25000,
    lines: [{ description: "Eco Polo T-Shirt", productCode: "PL-PO-001", quantity: 100, unit: "piece", unitPrice: 250, lineTotal: 25000 }],
  });
  assert.equal(view.lines[0].code, "PL-PO-001");
});

test("buildQuoteView: the same product code renders regardless of any size/colour wording in the description", () => {
  const line = (desc) => ({ description: desc, productCode: "PL-PO-001", quantity: 10, unit: "piece", unitPrice: 250, lineTotal: 2500 });
  const a = buildQuoteView({ reference: "R", customer: {}, currency: "INR", subtotal: 0, grandTotal: 0, lines: [line("Eco Polo — Small / Black")] });
  const b = buildQuoteView({ reference: "R", customer: {}, currency: "INR", subtotal: 0, grandTotal: 0, lines: [line("Eco Polo — XXL / Navy")] });
  assert.equal(a.lines[0].code, "PL-PO-001");
  assert.equal(b.lines[0].code, "PL-PO-001");
});

// ── Launch backfill map integrity (task §27) ───────────────────────────

test("productCodeMap: 46 products, all valid format, zero duplicates", () => {
  const entries = Object.entries(PRODUCT_CODE_BY_SLUG);
  assert.equal(entries.length, 46);
  const codes = entries.map(([, code]) => code);
  assert.equal(new Set(codes).size, codes.length, "duplicate product code in the map");
  for (const [slug, code] of entries) {
    assert.ok(isValidProductCode(code), `${slug} -> ${code}`);
  }
});

test("productCodeMap: numbering is sequential (001..N) within every family", () => {
  const byFamily = {};
  for (const code of Object.values(PRODUCT_CODE_BY_SLUG)) {
    const fam = productCodeFamily(code);
    (byFamily[fam] ||= []).push(Number.parseInt(code.slice(-3), 10));
  }
  for (const [fam, nums] of Object.entries(byFamily)) {
    const sorted = [...nums].sort((x, y) => x - y);
    assert.deepEqual(
      sorted,
      Array.from({ length: sorted.length }, (_, i) => i + 1),
      `family ${fam} is not numbered 1..${sorted.length}`,
    );
  }
});
