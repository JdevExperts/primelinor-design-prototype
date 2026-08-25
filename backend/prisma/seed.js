/**
 * DEV SEED ONLY — a handful of representative products covering all three
 * price modes, mirroring a few real entries already in the frontend's mock
 * catalogue (src/data/catalogData.js) so the two are easy to compare while
 * the frontend is transitioning onto the real API.
 *
 * This does NOT read from or write to the old primelinor-bulk production
 * database, and does not touch production S3. Selected real products will
 * be recreated manually later, per the project's explicit no-auto-migration
 * decision.
 */
const { PrismaClient } = require("@prisma/client");
const { assertSeedAllowed } = require("../src/utils/seedGuard");

assertSeedAllowed();

const prisma = new PrismaClient();

const COLORS = [
  { slug: "white", name: "White", hex: "#e8eaee" },
  { slug: "navy", name: "Navy", hex: "#22304a" },
  { slug: "charcoal", name: "Charcoal", hex: "#2b2b33" },
  { slug: "melange", name: "Grey Melange", hex: "#c3c7ce" },
  { slug: "sand", name: "Sand", hex: "#e3ddd0" },
  { slug: "maroon", name: "Maroon", hex: "#5c2733" },
];

const TAGS = [
  { slug: "corporate-teams", name: "Corporate Teams" },
  { slug: "startups", name: "Startups" },
  { slug: "events", name: "Events" },
  { slug: "schools-colleges", name: "Schools & Colleges" },
  { slug: "marketing-campaigns", name: "Marketing Campaigns" },
  { slug: "employee-gifting", name: "Employee Gifting" },
  { slug: "promotional", name: "Promotional" },
];

const CATEGORIES = [
  { slug: "tshirts", name: "T-Shirts", sortOrder: 1 },
  { slug: "polo", name: "Polo T-Shirts", sortOrder: 2 },
  { slug: "bottles", name: "Bottles & Drinkware", sortOrder: 3 },
  { slug: "bags", name: "Bags", sortOrder: 4 },
  { slug: "kits", name: "Gift Kits", sortOrder: 5 },
];

const SIZE_VARIANTS = ["S", "M", "L", "XL", "XXL"].map((label, i) => ({
  code: label.toLowerCase(),
  label,
  sortOrder: i,
}));

async function upsertLookups() {
  const colors = {};
  for (const c of COLORS) {
    colors[c.slug] = await prisma.color.upsert({
      where: { slug: c.slug },
      update: { name: c.name, hex: c.hex },
      create: c,
    });
  }

  const tags = {};
  for (const t of TAGS) {
    tags[t.slug] = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: t,
    });
  }

  const categories = {};
  for (const c of CATEGORIES) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    });
  }

  return { colors, tags, categories };
}

async function upsertProduct({ colors, tags, categories }, def) {
  const existing = await prisma.product.findUnique({ where: { slug: def.slug } });
  if (existing) {
    // Re-running the seed replaces this product's child rows cleanly rather
    // than accumulating duplicates.
    await prisma.product.delete({ where: { slug: def.slug } });
  }

  const product = await prisma.product.create({
    data: {
      slug: def.slug,
      name: def.name,
      categoryId: categories[def.category].id,
      description: def.description,
      longSpec: def.longSpec,
      material: def.material ?? null,
      gsm: def.gsm ?? null,
      moq: def.moq,
      unit: def.unit,
      priceMode: def.priceMode,
      fixedPrice: def.fixedPrice ?? null,
      customizable: def.customizable ?? true,
      variantType: def.variantType ?? null,
      dispatchEstimate: def.dispatchEstimate ?? null,
      sortOrder: def.sortOrder ?? 0,
      priceTiers: def.tiers
        ? { create: def.tiers.map((t, i) => ({ ...t, sortOrder: i })) }
        : undefined,
      colors: {
        create: def.colors.map((slug, i) => ({ colorId: colors[slug].id, sortOrder: i })),
      },
      variants: def.variantType
        ? { create: SIZE_VARIANTS.map((v) => ({ ...v })) }
        : undefined,
      specifications: def.specifications
        ? { create: def.specifications.map((s, i) => ({ ...s, sortOrder: i })) }
        : undefined,
      tags: {
        create: def.tags.map((slug) => ({ tagId: tags[slug].id })),
      },
    },
  });

  return product;
}

const PRODUCTS = [
  {
    slug: "cotton-round-neck",
    name: "Premium Cotton Round Neck T-Shirt",
    category: "tshirts",
    description:
      "An everyday corporate tee with a clean round neck and a fabric weight that holds print well.",
    longSpec: "180 GSM • 100% Cotton • Regular Fit",
    material: "cotton",
    gsm: 180,
    moq: 5,
    unit: "piece",
    priceMode: "TIERED",
    tiers: [
      { minQty: 5, maxQty: 49, unitPrice: 149 },
      { minQty: 50, maxQty: 499, unitPrice: 145 },
      { minQty: 500, maxQty: 4999, unitPrice: 139 },
    ],
    colors: ["white", "navy", "charcoal", "melange", "sand"],
    customizable: true,
    variantType: "size",
    specifications: [
      { label: "Fabric", value: "100% Cotton" },
      { label: "GSM", value: "180 GSM" },
      { label: "Fit", value: "Regular Fit" },
      { label: "Neck", value: "Round Neck" },
    ],
    dispatchEstimate: "7–10 working days",
    tags: ["corporate-teams", "events"],
    sortOrder: 1,
  },
  {
    slug: "premium-polo",
    name: "Premium Polo T-Shirt",
    category: "polo",
    description: "A pique-cotton polo built for consistent, coordinated team apparel.",
    longSpec: "220 GSM • Pique Cotton • Regular Fit",
    material: "cotton",
    gsm: 220,
    moq: 10,
    unit: "piece",
    priceMode: "TIERED",
    tiers: [
      { minQty: 10, maxQty: 99, unitPrice: 329 },
      { minQty: 100, maxQty: 999, unitPrice: 315 },
      { minQty: 1000, maxQty: null, unitPrice: 299 },
    ],
    colors: ["navy", "white", "charcoal", "maroon", "sand"],
    customizable: true,
    variantType: "size",
    specifications: [
      { label: "Fabric", value: "Pique Cotton" },
      { label: "GSM", value: "220 GSM" },
      { label: "Neck", value: "Polo Collar" },
    ],
    dispatchEstimate: "7–10 working days",
    tags: ["corporate-teams"],
    sortOrder: 2,
  },
  {
    slug: "corporate-bottle",
    name: "Custom Corporate Bottle",
    category: "bottles",
    description: "A 750 ml stainless bottle for desks, kits and field teams.",
    longSpec: "750 ml • Stainless Steel • Single Wall",
    material: "stainless",
    gsm: null,
    moq: 50,
    unit: "piece",
    priceMode: "FIXED",
    fixedPrice: 449,
    colors: ["white", "navy", "charcoal"],
    customizable: true,
    specifications: [
      { label: "Capacity", value: "750 ml" },
      { label: "Material", value: "Stainless Steel" },
      { label: "Finish", value: "Powder coat" },
    ],
    dispatchEstimate: "8–12 working days",
    tags: ["corporate-teams", "employee-gifting"],
    sortOrder: 3,
  },
  {
    slug: "canvas-tote",
    name: "Canvas Tote Bag",
    category: "bags",
    description: "A 12oz natural canvas tote, a dependable event and promotional staple.",
    longSpec: "12 oz • Natural Canvas",
    material: "canvas",
    gsm: null,
    moq: 25,
    unit: "piece",
    priceMode: "TIERED",
    tiers: [
      { minQty: 25, maxQty: 249, unitPrice: 159 },
      { minQty: 250, maxQty: null, unitPrice: 145 },
    ],
    colors: ["sand", "navy", "charcoal"],
    customizable: true,
    specifications: [
      { label: "Material", value: "Canvas" },
      { label: "Weight", value: "12 oz" },
    ],
    dispatchEstimate: "7–10 working days",
    tags: ["events", "promotional"],
    sortOrder: 4,
  },
  {
    slug: "welcome-kit",
    name: "Employee Welcome Kit",
    category: "kits",
    description:
      "A curated onboarding kit. Apparel, desk and drinkware can be branded as a set. Final contents are confirmed in quotation.",
    longSpec: "Apparel • Desk • Drinkware",
    material: "mixed",
    gsm: null,
    moq: 25,
    unit: "kit",
    priceMode: "QUOTE_ONLY",
    colors: ["sand", "navy"],
    customizable: true,
    specifications: [
      { label: "Typical contents", value: "Tee, bottle, notebook, pen" },
      { label: "Packaging", value: "Branded box" },
    ],
    dispatchEstimate: "10–14 working days",
    tags: ["employee-gifting", "corporate-teams"],
    sortOrder: 5,
  },
];

async function main() {
  const lookups = await upsertLookups();

  const created = {};
  for (const def of PRODUCTS) {
    created[def.slug] = await upsertProduct(lookups, def);
  }

  // A couple of ordered related-product links for PDP's "You may also like".
  const relate = async (fromSlug, toSlugs) => {
    for (const [i, toSlug] of toSlugs.entries()) {
      await prisma.productRelated.upsert({
        where: {
          productId_relatedProductId: {
            productId: created[fromSlug].id,
            relatedProductId: created[toSlug].id,
          },
        },
        update: { sortOrder: i },
        create: {
          productId: created[fromSlug].id,
          relatedProductId: created[toSlug].id,
          sortOrder: i,
        },
      });
    }
  };
  await relate("cotton-round-neck", ["premium-polo", "canvas-tote"]);
  await relate("premium-polo", ["cotton-round-neck", "corporate-bottle"]);

  console.log(`Seeded ${PRODUCTS.length} products across ${CATEGORIES.length} categories.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
