/**
 * One-time, hand-audited Product Code assignment for the launch catalogue
 * (46 active products). Deterministic: the family prefix was chosen per
 * product family (not just primary category), then numbered sequentially
 * by slug within each family.
 *
 * This map is the single source of truth for:
 *  - the backfill in the add_product_code migration (mirrored as SQL there)
 *  - prisma/seed.js (so a fresh `migrate reset` + seed still satisfies the
 *    NOT NULL + UNIQUE constraint)
 *  - test/productCodeBackfill.test.js (no duplicates / regex / family sanity)
 *
 * Family prefixes: TS round-neck/general tee · DF dry-fit/sports tee ·
 * OS oversized tee · PO polo · HD hoodie · UN uniform · CP cap · BG bag ·
 * BT bottle/drinkware · MG mug · PN pen · NB notebook/diary · VC visiting
 * card · CL calendar · GK gift kit · PM promotional merchandise.
 */
const PRODUCT_CODE_BY_SLUG = {
  // TS — round neck / general t-shirts
  "biowash-round-neck-t-shirt": "PL-TS-001",
  "cotton-round-neck": "PL-TS-002",
  "cotton-round-neck-t-shirt-value": "PL-TS-003",
  "kids-polyester-t-shirt": "PL-TS-004",
  "kids-round-neck-t-shirt": "PL-TS-005",
  "value-round-neck-t-shirt": "PL-TS-006",

  // DF — dry-fit / sports t-shirts
  "dry-fit-performance-t-shirt": "PL-DF-001",
  "dry-fit-round-neck-t-shirt": "PL-DF-002",
  "dry-fit-sports-t-shirt": "PL-DF-003",
  "premium-sports-casual-t-shirt": "PL-DF-004",

  // OS — oversized t-shirts
  "college-batch-oversized-t-shirt": "PL-OS-001",
  "oversized-t-shirt": "PL-OS-002",
  "premium-terry-oversized-t-shirt": "PL-OS-003",

  // PO — polo t-shirts
  "eco-polo-t-shirt": "PL-PO-001",
  "honeycomb-matty-polo-t-shirt": "PL-PO-002",
  "premium-matty-polo-t-shirt": "PL-PO-003",
  "premium-micro-polo-t-shirt": "PL-PO-004",
  "premium-polo": "PL-PO-005",
  "premium-tipping-polo-t-shirt": "PL-PO-006",
  "spun-matty-polo-t-shirt": "PL-PO-007",

  // HD — hoodies
  "pullover-hoodie": "PL-HD-001",
  "zipper-hoodie": "PL-HD-002",

  // UN — uniforms
  "corporate-staff-uniform-tshirt": "PL-UN-001",
  "school-uniform-polo-t-shirt": "PL-UN-002",

  // CP — caps
  "classic-cap": "PL-CP-001",
  "premium-cap": "PL-CP-002",

  // BG — bags
  "canvas-tote": "PL-BG-001",
  "cotton-tote-bag": "PL-BG-002",
  "drawstring-bag": "PL-BG-003",
  "laptop-backpack": "PL-BG-004",

  // BT — bottles / drinkware
  "corporate-bottle": "PL-BT-001",
  "sipper-tumbler": "PL-BT-002",
  "vacuum-insulated-bottle": "PL-BT-003",

  // MG — mugs
  "ceramic-mug": "PL-MG-001",

  // PN — pens
  "metal-pen": "PL-PN-001",
  "plastic-promotional-pen": "PL-PN-002",

  // NB — notebooks / diaries
  "a5-notebook-diary": "PL-NB-001",
  "executive-notebook": "PL-NB-002",

  // VC — visiting cards
  "premium-visiting-cards": "PL-VC-001",

  // CL — calendars
  "custom-table-calendar": "PL-CL-001",

  // GK — gift kits
  "conference-kit": "PL-GK-001",
  "event-essentials-kit": "PL-GK-002",
  "executive-gift-set": "PL-GK-003",
  "festival-gift-box": "PL-GK-004",
  "welcome-kit": "PL-GK-005",

  // PM — promotional merchandise
  "promotional-merchandise-kit": "PL-PM-001",
};

module.exports = { PRODUCT_CODE_BY_SLUG };
