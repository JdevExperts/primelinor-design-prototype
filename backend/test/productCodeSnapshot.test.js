const test = require("node:test");
const assert = require("node:assert/strict");

const { resolveRfqItem } = require("../src/services/rfqItem");
const { writeLines } = require("../src/services/quotationService");

/**
 * These exercise the snapshot-freeze paths with a hand-rolled fake `tx`
 * (no database) — the same technique the codebase already uses for pure
 * service logic.
 */

// ── H. RFQ snapshot stores the Product Code at submission time ───────────

test("resolveRfqItem: freezes the live product's Product Code onto the RFQ item", async () => {
  let createdData = null;
  const tx = {
    product: {
      findUnique: async () => ({
        id: "prod-1",
        slug: "eco-polo-t-shirt",
        productCode: "PL-PO-001",
        name: "Eco Polo T-Shirt",
        active: true,
        priceTiers: [],
        colors: [],
        variants: [],
      }),
    },
    rFQItem: {
      create: async ({ data }) => {
        createdData = data;
        return { id: "rfqitem-1", ...data };
      },
    },
  };

  await resolveRfqItem(tx, "rfq-1", { productId: "eco-polo-t-shirt", quantity: 100 }, 0);
  assert.equal(createdData.productCodeSnapshot, "PL-PO-001");
});

test("resolveRfqItem: colour / size selection does not affect the snapshotted Product Code (task §28 C/D)", async () => {
  const fakeProduct = {
    id: "prod-1",
    slug: "eco-polo-t-shirt",
    productCode: "PL-PO-001",
    name: "Eco Polo T-Shirt",
    active: true,
    priceTiers: [],
    colors: [{ color: { id: "c-white", slug: "white", name: "White" } }],
    variants: [{ id: "v-s", code: "S", label: "Small", active: true }],
  };
  const runWith = async (item) => {
    let data = null;
    const tx = {
      product: { findUnique: async () => fakeProduct },
      rFQItem: { create: async ({ data: d }) => ((data = d), { id: "x", ...d }) },
    };
    await resolveRfqItem(tx, "rfq-1", { productId: "eco-polo-t-shirt", quantity: 50, ...item }, 0);
    return data.productCodeSnapshot;
  };

  assert.equal(await runWith({ colorId: "white", variantId: "S" }), "PL-PO-001");
  assert.equal(await runWith({ colorId: "white", variantId: "M" }), "PL-PO-001"); // unknown size still same code
  assert.equal(await runWith({}), "PL-PO-001");
});

// ── I. Quotation line freezes the Product Code from its linked RFQ item ──

test("writeLines: copies each line's Product Code from the linked RFQ item snapshot", async () => {
  let created = null;
  const tx = {
    quotationLine: {
      deleteMany: async () => ({ count: 0 }),
      createMany: async ({ data }) => ((created = data), { count: data.length }),
    },
    rFQItem: {
      findMany: async ({ where }) => {
        assert.deepEqual(where.id.in, ["rfqitem-1"]);
        return [{ id: "rfqitem-1", productCodeSnapshot: "PL-PO-001" }];
      },
    },
  };

  await writeLines(tx, "quotation-1", [
    { rfqItemId: "rfqitem-1", lineType: "PRODUCT", description: "Eco Polo T-Shirt", quantity: 100, unitPrice: 250, lineTotal: 25000, sortOrder: 0 },
    { lineType: "SHIPPING", description: "Delivery", lineTotal: 500, sortOrder: 1 },
  ]);

  assert.equal(created[0].productCodeSnapshot, "PL-PO-001");
  assert.equal(created[1].productCodeSnapshot, null); // a custom line with no RFQ item has no code
});
