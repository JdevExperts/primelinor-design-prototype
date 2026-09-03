/**
 * RFQ working requirement (Phase C). The editable sales view of "what the
 * customer wants right now", kept separate from the immutable RFQItem[]
 * that records the original submission. A new quotation snapshots THESE.
 *
 * Seeded once from RFQItem at RFQ creation; a legacy RFQ with no working
 * items gets a lazy backfill (`ensureWorkingItems`). After that it is only
 * ever changed by explicit ADMIN/SALES edits here — it never syncs back to
 * RFQItem and never auto-updates from a quotation.
 */
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { recordStaffActivity } = require("./rfqActivity");

const WORKING_SELECT = {
  id: true,
  productId: true,
  productCodeSnapshot: true,
  productNameSnapshot: true,
  description: true,
  quantity: true,
  unit: true,
  specSnapshot: true,
  colorNameSnapshot: true,
  variantLabelSnapshot: true,
  sortOrder: true,
};

/** Shape one RFQItem into working-item create data. */
function fromRfqItem(item, sortOrder) {
  return {
    productId: item.productId || null,
    productCodeSnapshot: item.productCodeSnapshot || null,
    productNameSnapshot: item.productNameSnapshot || null,
    description: item.description || null,
    quantity: item.quantity ?? null,
    unit: item.unitSnapshot || null,
    specSnapshot: item.specSnapshot || null,
    colorNameSnapshot: item.colorNameSnapshot || null,
    variantLabelSnapshot: item.variantLabelSnapshot || null,
    sortOrder,
  };
}

/** Called inside the RFQ-creation transaction — copy the submission once. */
async function seedWorkingItemsFromRfqItems(tx, rfqId) {
  const items = await tx.rFQItem.findMany({ where: { rfqId }, orderBy: { sortOrder: "asc" } });
  if (!items.length) return;
  await tx.rfqWorkingItem.createMany({
    data: items.map((item, i) => ({ rfqId, ...fromRfqItem(item, i) })),
  });
}

/** Backfill working items for a legacy RFQ that has none. Safe no-op otherwise. */
async function ensureWorkingItems(rfqId) {
  const count = await prisma.rfqWorkingItem.count({ where: { rfqId } });
  if (count > 0) return;
  await prisma.$transaction((tx) => seedWorkingItemsFromRfqItems(tx, rfqId));
}

async function listWorkingItems(rfqId) {
  await ensureWorkingItems(rfqId);
  return prisma.rfqWorkingItem.findMany({ where: { rfqId }, orderBy: { sortOrder: "asc" }, select: WORKING_SELECT });
}

async function addWorkingItem(rfqId, staffUser, input) {
  const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });
  if (!rfq) throw ApiError.notFound("RFQ not found");
  await ensureWorkingItems(rfqId);

  let productSnapshot = { productId: null, productCodeSnapshot: null, productNameSnapshot: null, specSnapshot: null };
  if (input.productId) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      select: { id: true, productCode: true, name: true, longSpec: true, description: true, unit: true },
    });
    if (!product) throw ApiError.badRequest("That product no longer exists.");
    productSnapshot = {
      productId: product.id,
      productCodeSnapshot: product.productCode,
      productNameSnapshot: product.name,
      specSnapshot: product.longSpec || product.description || null,
    };
  }
  if (!productSnapshot.productId && !input.description) {
    throw ApiError.badRequest("Pick a catalogue product or enter a description for a custom line.");
  }

  const maxOrder = await prisma.rfqWorkingItem.aggregate({ where: { rfqId }, _max: { sortOrder: true } });

  return prisma.$transaction(async (tx) => {
    const created = await tx.rfqWorkingItem.create({
      data: {
        rfqId,
        ...productSnapshot,
        description: input.description || null,
        quantity: input.quantity ?? null,
        unit: input.unit || productSnapshot.unit || null,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
      select: WORKING_SELECT,
    });
    await recordStaffActivity(tx, {
      rfqId,
      type: "RFQ_WORKING_ITEM_ADDED",
      staffUserId: staffUser.id,
      metadata: {
        workingItemId: created.id,
        productCode: created.productCodeSnapshot || null,
        name: created.productNameSnapshot || created.description,
        quantity: created.quantity,
      },
    });
    return tx.rfqWorkingItem.findMany({ where: { rfqId }, orderBy: { sortOrder: "asc" }, select: WORKING_SELECT });
  });
}

async function updateWorkingItem(rfqId, itemId, staffUser, patch) {
  const existing = await prisma.rfqWorkingItem.findFirst({ where: { id: itemId, rfqId }, select: WORKING_SELECT });
  if (!existing) throw ApiError.notFound("Working item not found");

  const data = {};
  if (patch.quantity !== undefined) data.quantity = patch.quantity;
  if (patch.unit !== undefined) data.unit = patch.unit || null;
  if (patch.description !== undefined) data.description = patch.description || null;
  if (Object.keys(data).length === 0) return listWorkingItems(rfqId);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.rfqWorkingItem.update({ where: { id: itemId }, data, select: WORKING_SELECT });
    // Record only the fields that actually changed, before -> after.
    const changes = {};
    for (const key of Object.keys(data)) {
      if (existing[key] !== updated[key]) changes[key] = { from: existing[key], to: updated[key] };
    }
    if (Object.keys(changes).length) {
      await recordStaffActivity(tx, {
        rfqId,
        type: "RFQ_WORKING_ITEM_UPDATED",
        staffUserId: staffUser.id,
        metadata: {
          workingItemId: itemId,
          name: updated.productNameSnapshot || updated.description,
          productCode: updated.productCodeSnapshot || null,
          changes,
        },
      });
    }
    return tx.rfqWorkingItem.findMany({ where: { rfqId }, orderBy: { sortOrder: "asc" }, select: WORKING_SELECT });
  });
}

async function removeWorkingItem(rfqId, itemId, staffUser) {
  const existing = await prisma.rfqWorkingItem.findFirst({ where: { id: itemId, rfqId }, select: WORKING_SELECT });
  if (!existing) throw ApiError.notFound("Working item not found");

  return prisma.$transaction(async (tx) => {
    await tx.rfqWorkingItem.delete({ where: { id: itemId } });
    await recordStaffActivity(tx, {
      rfqId,
      type: "RFQ_WORKING_ITEM_REMOVED",
      staffUserId: staffUser.id,
      metadata: {
        workingItemId: itemId,
        productCode: existing.productCodeSnapshot || null,
        name: existing.productNameSnapshot || existing.description,
        quantity: existing.quantity,
      },
    });
    return tx.rfqWorkingItem.findMany({ where: { rfqId }, orderBy: { sortOrder: "asc" }, select: WORKING_SELECT });
  });
}

async function reorderWorkingItems(rfqId, orderedIds, staffUser) {
  const rows = await prisma.rfqWorkingItem.findMany({ where: { rfqId }, select: { id: true } });
  const known = new Set(rows.map((r) => r.id));
  if (orderedIds.length !== known.size || !orderedIds.every((id) => known.has(id))) {
    throw ApiError.badRequest("The reorder list must contain every current working item exactly once.");
  }
  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.rfqWorkingItem.update({ where: { id }, data: { sortOrder: index } })),
  );
  await recordStaffActivity(prisma, {
    rfqId,
    type: "RFQ_REQUIREMENT_UPDATED",
    staffUserId: staffUser.id,
    metadata: { action: "reordered", count: orderedIds.length },
  });
  return listWorkingItems(rfqId);
}

module.exports = {
  WORKING_SELECT,
  fromRfqItem,
  seedWorkingItemsFromRfqItems,
  ensureWorkingItems,
  listWorkingItems,
  addWorkingItem,
  updateWorkingItem,
  removeWorkingItem,
  reorderWorkingItems,
};
