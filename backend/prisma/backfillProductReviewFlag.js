/**
 * Idempotent backfill: ensure the PRODUCT_REVIEW_PENDING config exists and
 * every Product carries `PRODUCT_REVIEW_PENDING = true`. The
 * 20260903160000_product_attribute_framework migration already does this;
 * this script exists so it can be safely re-run (e.g. after importing
 * products) without creating duplicate rows.
 *
 *   node prisma/backfillProductReviewFlag.js
 */
const prisma = require("../src/lib/prisma");
const { REVIEW_PENDING_KEY, backfillProductAttribute } = require("../src/services/productAttributeService");

async function main() {
  const config = await prisma.productAttributeConfig.upsert({
    where: { key: REVIEW_PENDING_KEY },
    update: {},
    create: {
      key: REVIEW_PENDING_KEY,
      name: "Product Review Pending",
      valueType: "BOOLEAN",
      description: "Marks products that still require manual catalogue review.",
    },
  });

  const total = await prisma.product.count();
  const before = await prisma.productAttribute.count({ where: { attributeId: config.id } });
  const { added } = await backfillProductAttribute(REVIEW_PENDING_KEY, true);
  const after = await prisma.productAttribute.count({ where: { attributeId: config.id } });

  console.log(`config: ${config.key} (${config.valueType})`);
  console.log(`products: ${total} | review-pending rows before: ${before} | added: ${added} | after: ${after}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
