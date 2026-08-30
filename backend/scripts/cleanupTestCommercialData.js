#!/usr/bin/env node
/**
 * One-time removal of disposable local-dev commercial-workflow test data
 * (Phase 6B §14) — every Lead/RFQ/Quotation currently in this dev
 * database was created during development smoke testing, not by a real
 * customer. Confirmed by content inspection before writing this script,
 * not by name pattern alone: every single contact is either an obvious
 * test label ("RFQ Regression Test", "Studio User", "Kit Builder User",
 * "Expiry Test", "Jordan Buyer"), uses test@example.com, or shares one of
 * a handful of repeated synthetic phone numbers used across many
 * unrelated-looking "customer" names — a pattern real inbound leads
 * would not produce. There is no ambiguous record in the current DB;
 * if a future run of this script finds any Lead/RFQ whose contact name
 * doesn't match the known test-label patterns below, it is reported and
 * skipped rather than deleted, so this never silently sweeps up a real
 * customer record that happens to land in the DB alongside test data.
 *
 * Deletes Lead and RFQ rows directly; RFQItem, RFQActivity, InternalNote,
 * Quotation, and QuotationLine all cascade from RFQ at the DB level
 * (onDelete: Cascade in schema.prisma) so no separate cleanup is needed
 * for those. ArtworkAsset rows referencing a deleted RFQItem are set to
 * rfqItemId=null (onDelete: SetNull) rather than deleted — that's
 * cleanupExpiredArtwork.js's job, on its own expiry-based schedule, not
 * this script's. Contact rows are deleted only once nothing else
 * references them.
 *
 * Usage:
 *   node scripts/cleanupTestCommercialData.js --dry-run
 *   ALLOW_TEST_DATA_CLEANUP=true node scripts/cleanupTestCommercialData.js
 */
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const prisma = require("../src/lib/prisma");
const { assertBackfillAllowed } = require("../src/utils/backfillGuard");

const DRY_RUN = process.argv.includes("--dry-run");

// Known test-contact name/label patterns seen in this dev DB. A Lead/RFQ
// whose contact name doesn't match any of these, or whose email isn't the
// literal test@example.com, is treated as NOT confirmed disposable and is
// left untouched.
const TEST_NAME_PATTERNS = [
  /^RFQ Regression Test$/i,
  /^Studio User$/i,
  /^Kit Buyer$/i,
  /^Kit Builder User$/i,
  /^Expiry Test$/i,
  /^Jordan Buyer$/i,
  /^Anita Desai$/i,
  /^Neha Kapoor$/i,
  /^Priya Sharma$/i,
  /^Rahul Verma$/i,
  /^Vikram Nair$/i,
  /^Karan Mehta$/i,
  /^Sonal Rao$/i,
  /^Divya Nair$/i,
  /^Phase6B Smoke Test$/i,
];

function isConfirmedTestContact(contact) {
  if (!contact) return false;
  if (contact.email === "test@example.com") return true;
  return TEST_NAME_PATTERNS.some((re) => re.test(contact.name || ""));
}

function assertSafeToRun() {
  try {
    assertBackfillAllowed(process.env, { flagName: "ALLOW_TEST_DATA_CLEANUP", dryRun: DRY_RUN, label: "cleanup-test-commercial-data" });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

async function main() {
  assertSafeToRun();
  const dbUrl = new URL(process.env.DATABASE_URL);
  console.log(`[cleanup-test-data] target database: ${dbUrl.hostname}:${dbUrl.port}${dbUrl.pathname}${DRY_RUN ? "  (DRY RUN)" : ""}`);

  const leads = await prisma.lead.findMany({ include: { contact: true } });
  const rfqs = await prisma.rFQ.findMany({ include: { contact: true } });

  const leadsToDelete = leads.filter((l) => isConfirmedTestContact(l.contact));
  const rfqsToDelete = rfqs.filter((r) => isConfirmedTestContact(r.contact));
  const skippedLeads = leads.filter((l) => !isConfirmedTestContact(l.contact));
  const skippedRfqs = rfqs.filter((r) => !isConfirmedTestContact(r.contact));

  console.log(`[cleanup-test-data] Leads to delete: ${leadsToDelete.length} (${leadsToDelete.map((l) => l.reference).join(", ") || "none"})`);
  console.log(`[cleanup-test-data] RFQs to delete: ${rfqsToDelete.length} (${rfqsToDelete.map((r) => r.reference).join(", ") || "none"})`);
  if (skippedLeads.length || skippedRfqs.length) {
    console.log(
      `[cleanup-test-data] SKIPPED (not a recognized test-contact pattern — left untouched): ` +
        `${skippedLeads.length} lead(s), ${skippedRfqs.length} RFQ(s): ` +
        `${[...skippedLeads.map((l) => l.reference), ...skippedRfqs.map((r) => r.reference)].join(", ") || "none"}`,
    );
  }

  if (DRY_RUN) {
    console.log("[cleanup-test-data] Dry run — no changes made.");
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const rfq of rfqsToDelete) {
      await tx.rFQ.delete({ where: { id: rfq.id } });
    }
    for (const lead of leadsToDelete) {
      // A lead's RFQ (if any) may already be gone above; leadId on any
      // remaining RFQ is SetNull automatically by the DB, never blocking.
      await tx.lead.delete({ where: { id: lead.id } });
    }

    // Delete now-orphaned test contacts (safe: Contact.leads/rfqs is
    // onDelete: Restrict, so this only succeeds for contacts nothing
    // still references — i.e. never a contact still tied to a real,
    // untouched Lead/RFQ).
    const contactIds = [...new Set([...leadsToDelete, ...rfqsToDelete].map((r) => r.contactId))];
    for (const contactId of contactIds) {
      const stillReferenced =
        (await tx.lead.count({ where: { contactId } })) > 0 || (await tx.rFQ.count({ where: { contactId } })) > 0;
      if (!stillReferenced) {
        await tx.contact.delete({ where: { id: contactId } }).catch(() => {});
      }
    }
  });

  console.log("[cleanup-test-data] Done.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[cleanup-test-data] Fatal error:", err);
  process.exitCode = 1;
});
