#!/usr/bin/env node
/**
 * Sweeps PENDING ArtworkAsset rows past their expiresAt — an upload the
 * user made but never attached to a submitted RFQ (abandoned form, upload
 * succeeded then they closed the tab). Deletes the underlying storage
 * object first, then the DB row, so a failed storage delete never leaves
 * an orphaned DB row pointing at nothing (worst case: the storage object
 * outlives the DB row by one run, cleaned up on the next pass by key
 * still being logged below).
 *
 * Run manually (`node scripts/cleanupExpiredArtwork.js`) or on a cron —
 * no scheduler is wired up in this phase, per the Phase 2 brief's
 * exclusion of ops/infra automation.
 */
const prisma = require("../src/lib/prisma");
const storage = require("../src/services/storage");

async function main() {
  const expired = await prisma.artworkAsset.findMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
  });

  if (!expired.length) {
    console.log("[cleanup] no expired pending artwork found");
    return;
  }

  let deleted = 0;
  for (const asset of expired) {
    try {
      await storage.deleteObject(asset.storageKey);
      await prisma.artworkAsset.delete({ where: { id: asset.id } });
      deleted += 1;
    } catch (err) {
      console.error(`[cleanup] failed to remove artwork ${asset.id} (key: ${asset.storageKey}):`, err.message);
    }
  }

  console.log(`[cleanup] removed ${deleted}/${expired.length} expired pending artwork assets`);
}

main()
  .catch((err) => {
    console.error("[cleanup] fatal error:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
