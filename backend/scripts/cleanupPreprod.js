/**
 * Phase 6C-2 — Pre-production operational-data cleanup.
 *
 * Removes CLEAR TEST/DEMO transactional data (contacts, companies, leads,
 * RFQs + children, quotations + children, RFQ/quotation activity, internal
 * notes, artwork, test analytics) so the current development database can be
 * promoted to production with only real catalogue + staff data.
 *
 * PRESERVES, always: every catalogue entity (products, product codes,
 * categories, solutions, colours, assets, price tiers, specs, variants,
 * placement zones, tags, and all their mappings), every StaffUser, and the
 * PRODUCT_REVIEW_PENDING ProductAttributeConfig + its ProductAttribute rows.
 *
 * SAFETY
 *   - Dry-run by default. Prints exactly what would be deleted, nothing else.
 *   - Real deletion requires  --execute
 *   - With NODE_ENV=production it ALSO requires  --allow-production
 *   - The 21 analytics rows that are NOT flagged isTest=true (pre-launch dev
 *     QA traffic) are only removed with  --analytics-all . Without that flag
 *     only rows with isTest=true are deleted.
 *   - Deletion runs inside a single transaction — any failure rolls back.
 *
 * USAGE
 *   node scripts/cleanupPreprod.js                     # dry run
 *   node scripts/cleanupPreprod.js --execute           # delete test data
 *   node scripts/cleanupPreprod.js --execute --analytics-all
 *   node scripts/cleanupPreprod.js --execute --allow-production
 *
 * npm:  npm run cleanup:preprod -- --dry-run
 *       npm run cleanup:preprod -- --execute
 */
"use strict";

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const args = new Set(process.argv.slice(2));
const EXECUTE = args.has("--execute");
const DRY_RUN = !EXECUTE || args.has("--dry-run");
const ALLOW_PRODUCTION = args.has("--allow-production");
const ANALYTICS_ALL = args.has("--analytics-all");
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function banner(msg) {
  console.log("\n" + "=".repeat(72) + "\n" + msg + "\n" + "=".repeat(72));
}

async function snapshotCounts() {
  const [
    companies, contacts, leads, rfqs, rfqItems, rfqWorkingItems, rfqActivity,
    artworkAssets, quotations, quotationLines, internalNotes,
    analyticsAll, analyticsTest,
    products, categories, solutions, colors, staffUsers,
    productAttributeConfig, productAttribute,
  ] = await Promise.all([
    prisma.company.count(), prisma.contact.count(), prisma.lead.count(),
    prisma.rFQ.count(), prisma.rFQItem.count(), prisma.rfqWorkingItem.count(),
    prisma.rFQActivity.count(), prisma.artworkAsset.count(), prisma.quotation.count(),
    prisma.quotationLine.count(), prisma.internalNote.count(),
    prisma.analyticsEvent.count(), prisma.analyticsEvent.count({ where: { isTest: true } }),
    prisma.product.count(), prisma.category.count(), prisma.solution.count(),
    prisma.color.count(), prisma.staffUser.count(),
    prisma.productAttributeConfig.count(), prisma.productAttribute.count(),
  ]);
  return {
    "companies (DELETE)": companies,
    "contacts (DELETE)": contacts,
    "leads (DELETE)": leads,
    "rfqs (DELETE)": rfqs,
    "rfq_items (DELETE)": rfqItems,
    "rfq_working_items (DELETE)": rfqWorkingItems,
    "rfq_activity (DELETE)": rfqActivity,
    "artwork_assets (DELETE)": artworkAssets,
    "quotations (DELETE)": quotations,
    "quotation_lines (DELETE)": quotationLines,
    "internal_notes (DELETE)": internalNotes,
    "analytics_events isTest=true (DELETE)": analyticsTest,
    [`analytics_events other (${ANALYTICS_ALL ? "DELETE" : "KEEP"})`]: analyticsAll - analyticsTest,
    "── preserved ──": "",
    "products (KEEP)": products,
    "categories (KEEP)": categories,
    "solutions (KEEP)": solutions,
    "colors (KEEP)": colors,
    "staff_users (KEEP)": staffUsers,
    "product_attribute_configs (KEEP)": productAttributeConfig,
    "product_attributes (KEEP)": productAttribute,
  };
}

async function listCandidates() {
  const [contacts, companies, leads, rfqs, quotations] = await Promise.all([
    prisma.contact.findMany({ select: { id: true, name: true, email: true, phone: true } }),
    prisma.company.findMany({ select: { id: true, name: true } }),
    prisma.lead.findMany({ select: { id: true, reference: true, message: true } }),
    prisma.rFQ.findMany({ select: { id: true, reference: true, status: true, message: true } }),
    prisma.quotation.findMany({
      select: { id: true, groupReference: true, version: true, status: true, partyName: true, partyEmail: true, originType: true },
      orderBy: [{ quotationGroupId: "asc" }, { version: "asc" }],
    }),
  ]);

  banner("CANDIDATE TEST/DEMO RECORDS (verify before --execute)");
  console.log("\nContacts:");
  contacts.forEach((c) => console.log(`  - ${c.name} | ${c.phone} | ${c.email || "(no email)"}  [${c.id}]`));
  console.log("\nCompanies:");
  companies.forEach((c) => console.log(`  - ${c.name}  [${c.id}]`));
  console.log("\nLeads:");
  leads.forEach((l) => console.log(`  - ${l.reference} | "${(l.message || "").slice(0, 60)}"  [${l.id}]`));
  console.log("\nRFQs:");
  rfqs.forEach((r) => console.log(`  - ${r.reference} | ${r.status} | "${(r.message || "").slice(0, 50)}"  [${r.id}]`));
  console.log("\nQuotations:");
  quotations.forEach((q) =>
    console.log(
      `  - ${q.groupReference || "(RFQ-origin)"} v${q.version} | ${q.originType} | ${q.status} | ${q.partyName || "(no party)"} | ${q.partyEmail || "-"}  [${q.id}]`,
    ),
  );
}

async function runDeletion() {
  const analyticsWhere = ANALYTICS_ALL ? {} : { isTest: true };

  return prisma.$transaction(async (tx) => {
    const deleted = {};
    // Children first, then parents. Explicit even where FK cascade would
    // cover it, so the row counts are exact and the loose (rfq_id NULL,
    // quotation_id NULL) activity row is caught too.
    deleted.rfq_activity = (await tx.rFQActivity.deleteMany({})).count;
    deleted.internal_notes = (await tx.internalNote.deleteMany({})).count;
    deleted.quotation_lines = (await tx.quotationLine.deleteMany({})).count;
    // supersedesId is a self-FK with onDelete: SetNull — clear it first so a
    // bulk delete never trips referential ordering.
    await tx.quotation.updateMany({ data: { supersedesId: null }, where: { supersedesId: { not: null } } });
    deleted.quotations = (await tx.quotation.deleteMany({})).count;
    deleted.artwork_assets = (await tx.artworkAsset.deleteMany({})).count;
    deleted.rfq_working_items = (await tx.rfqWorkingItem.deleteMany({})).count;
    deleted.rfq_items = (await tx.rFQItem.deleteMany({})).count;
    deleted.rfqs = (await tx.rFQ.deleteMany({})).count;
    deleted.leads = (await tx.lead.deleteMany({})).count;
    deleted.contacts = (await tx.contact.deleteMany({})).count;
    deleted.companies = (await tx.company.deleteMany({})).count;
    deleted.analytics_events = (await tx.analyticsEvent.deleteMany({ where: analyticsWhere })).count;
    return deleted;
  });
}

async function main() {
  banner(
    `Phase 6C-2 pre-production cleanup — ${DRY_RUN ? "DRY RUN (no changes)" : "EXECUTE (will delete)"}` +
      `\nNODE_ENV=${process.env.NODE_ENV || "(unset)"}   analytics-all=${ANALYTICS_ALL}`,
  );

  if (EXECUTE && IS_PRODUCTION && !ALLOW_PRODUCTION) {
    console.error(
      "\nREFUSING TO RUN: NODE_ENV=production and --allow-production was not passed.\n" +
        "This deletes operational data. If this database genuinely has no real\n" +
        "customer records yet and you accept the consequences, re-run with\n" +
        "  --execute --allow-production\n",
    );
    process.exitCode = 1;
    return;
  }

  console.log("\nRecord counts BEFORE:");
  console.table(await snapshotCounts());

  await listCandidates();

  if (DRY_RUN) {
    banner("DRY RUN COMPLETE — nothing was deleted. Re-run with --execute to apply.");
    return;
  }

  banner("EXECUTING DELETION (single transaction)…");
  let deleted;
  try {
    deleted = await runDeletion();
  } catch (err) {
    console.error("\nDeletion failed — transaction rolled back. No changes made.\n", err);
    process.exitCode = 1;
    return;
  }

  console.log("\nRows deleted:");
  console.table(deleted);

  console.log("\nRecord counts AFTER:");
  console.table(await snapshotCounts());

  banner("CLEANUP COMPLETE.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
