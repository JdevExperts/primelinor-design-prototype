/**
 * Private negotiation notes attached to a quotation lineage (§8/§9).
 * Scoped by quotationGroupId so every version of a thread shares the same
 * note stream. Never exposed on a public endpoint or in the PDF.
 */
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { recordStaffActivity } = require("./rfqActivity");

async function loadGroupVersionIds(quotationId) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    select: { id: true, quotationGroupId: true, rfqId: true },
  });
  if (!quotation) throw ApiError.notFound("Quotation not found");
  const versions = await prisma.quotation.findMany({
    where: { quotationGroupId: quotation.quotationGroupId },
    select: { id: true },
  });
  return { quotation, versionIds: versions.map((v) => v.id) };
}

async function listNotes(quotationId) {
  const { versionIds } = await loadGroupVersionIds(quotationId);
  return prisma.internalNote.findMany({
    where: { quotationId: { in: versionIds } },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
}

async function addNote(quotationId, staffUser, body) {
  const { quotation } = await loadGroupVersionIds(quotationId);
  const text = (body || "").trim();
  if (!text) throw ApiError.badRequest("A note can't be empty.");

  return prisma.$transaction(async (tx) => {
    const note = await tx.internalNote.create({
      data: { quotationId: quotation.id, authorUserId: staffUser.id, body: text },
      include: { author: true },
    });
    await recordStaffActivity(tx, {
      ...(quotation.rfqId ? { rfqId: quotation.rfqId } : { quotationId: quotation.id }),
      type: "NOTE_ADDED",
      staffUserId: staffUser.id,
      metadata: { quotationId: quotation.id, noteId: note.id },
    });
    return note;
  });
}

async function updateNote(quotationId, noteId, staffUser, body) {
  const { versionIds } = await loadGroupVersionIds(quotationId);
  const note = await prisma.internalNote.findUnique({ where: { id: noteId } });
  if (!note || !versionIds.includes(note.quotationId)) throw ApiError.notFound("Note not found");
  if (note.authorUserId !== staffUser.id) {
    throw ApiError.badRequest("Only the note's author can edit it.");
  }
  const text = (body || "").trim();
  if (!text) throw ApiError.badRequest("A note can't be empty.");
  return prisma.internalNote.update({
    where: { id: noteId },
    data: { body: text },
    include: { author: true },
  });
}

module.exports = { listNotes, addNote, updateNote };
