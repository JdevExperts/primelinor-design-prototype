const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { recordStaffActivity } = require("./rfqActivity");
const { isTransitionAllowed } = require("./rfqStatusTransitions");
const { resolveRfqItem } = require("./rfqItem");
const { ensureWorkingItems } = require("./rfqWorkingItems");

const SUMMARY_INCLUDE = {
  contact: { include: { company: true } },
  assignedTo: true,
  items: { select: { estimatedTotal: true } },
};

const DETAIL_INCLUDE = {
  contact: { include: { company: true } },
  assignedTo: true,
  items: { include: { artworks: true }, orderBy: { sortOrder: "asc" } },
  workingItems: { orderBy: { sortOrder: "asc" } },
  activity: { orderBy: { createdAt: "desc" } },
  notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
  quotations: {
    include: { createdBy: true, lines: true, rfq: { select: { id: true, reference: true } } },
    orderBy: { version: "desc" },
  },
};

function buildRfqWhere({ status, source, assignedTo, dateFrom, dateTo, search }) {
  const where = {};
  if (status) where.status = status;
  if (source) where.sourceType = source;
  if (assignedTo === "unassigned") where.assignedToUserId = null;
  else if (assignedTo) where.assignedToUserId = assignedTo;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: "insensitive" } },
      { contact: { name: { contains: search, mode: "insensitive" } } },
      { contact: { phone: { contains: search, mode: "insensitive" } } },
      { contact: { email: { contains: search, mode: "insensitive" } } },
      { contact: { company: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }
  return where;
}

async function listRfqs({ status, source, assignedTo, dateFrom, dateTo, search, page, limit }) {
  const where = buildRfqWhere({ status, source, assignedTo, dateFrom, dateTo, search });
  const [total, rfqs] = await Promise.all([
    prisma.rFQ.count({ where }),
    prisma.rFQ.findMany({
      where,
      include: SUMMARY_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { rfqs, total };
}

async function getRfq(id) {
  const exists = await prisma.rFQ.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw ApiError.notFound("RFQ not found");
  // Legacy RFQs predate the working requirement — backfill on first open.
  await ensureWorkingItems(id);
  return prisma.rFQ.findUnique({ where: { id }, include: DETAIL_INCLUDE });
}

async function updateRfq(id, { status, assignedToUserId }, staffUser) {
  const rfq = await prisma.rFQ.findUnique({ where: { id } });
  if (!rfq) throw ApiError.notFound("RFQ not found");

  if (assignedToUserId !== undefined && assignedToUserId !== null) {
    const assignee = await prisma.staffUser.findUnique({ where: { id: assignedToUserId } });
    if (!assignee || !assignee.active) throw ApiError.badRequest("Assignee is not a valid active staff member.");
  }

  if (status !== undefined) {
    const allowed = isTransitionAllowed(rfq.status, status, { override: staffUser.role === "ADMIN" });
    if (!allowed) {
      throw ApiError.badRequest(`Cannot move an RFQ from ${rfq.status} to ${status}.`);
    }
  }

  const data = {};
  if (status !== undefined) data.status = status;
  if (assignedToUserId !== undefined) data.assignedToUserId = assignedToUserId;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.rFQ.update({ where: { id }, data, include: DETAIL_INCLUDE });

    if (status !== undefined && status !== rfq.status) {
      await recordStaffActivity(tx, {
        rfqId: id,
        type: "STATUS_CHANGED",
        staffUserId: staffUser.id,
        metadata: { from: rfq.status, to: status },
      });
    }
    if (assignedToUserId !== undefined && assignedToUserId !== rfq.assignedToUserId) {
      await recordStaffActivity(tx, {
        rfqId: id,
        type: "ASSIGNED",
        staffUserId: staffUser.id,
        metadata: { previousUserId: rfq.assignedToUserId, newUserId: assignedToUserId },
      });
    }

    return updated;
  });
}

async function addNote(rfqId, staffUser, body) {
  const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });
  if (!rfq) throw ApiError.notFound("RFQ not found");

  return prisma.$transaction(async (tx) => {
    const note = await tx.internalNote.create({
      data: { rfqId, authorUserId: staffUser.id, body },
      include: { author: true },
    });
    await recordStaffActivity(tx, {
      rfqId,
      type: "NOTE_ADDED",
      staffUserId: staffUser.id,
      metadata: { noteId: note.id },
    });
    return note;
  });
}

/** Staff manually adding a described/catalog item to an existing RFQ (Phase 3 §10). */
async function addItem(rfqId, item) {
  const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId }, include: { items: true } });
  if (!rfq) throw ApiError.notFound("RFQ not found");

  return prisma.$transaction(async (tx) => {
    await resolveRfqItem(tx, rfqId, item, rfq.items.length);
    return tx.rFQ.findUnique({ where: { id: rfqId }, include: DETAIL_INCLUDE });
  });
}

module.exports = { listRfqs, getRfq, updateRfq, addNote, addItem, DETAIL_INCLUDE };
