/**
 * Solution hero-image management — mirrors categoryImageAdmin.js exactly:
 * `imageStorageKey` set only for an object this system uploaded, so we
 * always know whether we're allowed to delete the underlying object. A
 * Solution only ever has one image (Solutions Phase A §8/§22 — no gallery).
 */
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const storage = require("../storage/solutionAssets");
const { validateUploadedProductImage } = require("../productAssetValidation");

async function assertSolutionExists(solutionId) {
  const solution = await prisma.solution.findUnique({ where: { id: solutionId } });
  if (!solution) throw ApiError.notFound("Solution not found.");
  return solution;
}

/** Safe replacement: upload under a new key, update the DB row, then delete the previous object only if this system owned it. */
async function setSolutionImage(solutionId, file, meta = {}) {
  const solution = await assertSolutionExists(solutionId);

  const result = validateUploadedProductImage(file);
  if (!result.ok) throw ApiError.badRequest(result.message);

  const key = storage.generateSolutionAssetKey(solutionId, file.originalname);
  await storage.putObject({ buffer: file.buffer, contentType: result.mimeType, key });
  const url = storage.buildPublicUrl(key);

  const updated = await prisma.solution.update({
    where: { id: solutionId },
    data: {
      imageUrl: url,
      imageStorageKey: key,
      ...(meta.alt !== undefined && { imageAlt: meta.alt }),
    },
  });

  if (solution.imageStorageKey && solution.imageStorageKey !== key) {
    await storage.deleteObject(solution.imageStorageKey);
  }

  return updated;
}

/** Clears the image reference; only deletes the underlying object if this system owned it. */
async function removeSolutionImage(solutionId) {
  const solution = await assertSolutionExists(solutionId);

  const updated = await prisma.solution.update({
    where: { id: solutionId },
    data: { imageUrl: null, imageStorageKey: null, imageAlt: null },
  });

  if (solution.imageStorageKey) {
    await storage.deleteObject(solution.imageStorageKey);
  }

  return updated;
}

module.exports = { setSolutionImage, removeSolutionImage };
