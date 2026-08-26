/**
 * The curated, human-reviewed decision table for every legacy product
 * (Phase 6A §4/§5/§11-22). This is deliberately NOT auto-derived from the
 * dump — a fully automatic transform can't tell "Round Neck 111" through
 * "117" are seven near-duplicate SKUs of the same polyester-round-neck
 * line, or that "MAHAKAL COTTON KURTA" doesn't belong in a rebranded B2B
 * merchandise marketplace, or that "GIFT SET" (a notebook+pen combo) was
 * mis-filed under the Corporate T-shirt category. Every entry here was
 * decided by actually reading the dump's names/descriptions/GSM/fabric
 * (see the inspection notes in this phase's completion report).
 *
 * Keyed by the legacy product's exact `name` (verified unique across all
 * 31 rows) rather than its legacy `id`, since the id is a throwaway UUID
 * with zero meaning outside the old DB and the name is what a reviewer
 * actually reads when auditing this table.
 */

/** Legacy products excluded from import, and why — surfaced in the review report (§48), never silently dropped. */
const SKIP_REASONS = {
  "Corporate Classic Round Neck":
    "inactive in the legacy DB (is_active=false) and its only images are placehold.co placeholder graphics, not real product photos — also fully redundant with the several other active cotton round-neck entries imported.",
  "GIFT SET":
    "mis-categorized: filed under the Corporate T-shirt category with a fabricated GSM (250), but its own description describes a notebook+metal-pen executive gift box — not apparel at all. Reused as the content basis for the new 'Executive Gift Set' Corporate Gifts product instead of importing it as a T-shirt.",
  "MAHAKAL COTTON KURTA":
    "a religious/festival-wear kurta with devotional branding ('Mahadev devotees') — outside the scope of the redesigned B2B corporate-merchandise marketplace. Not representative catalogue content.",
  "Round Neck True Biowash":
    "near-duplicate of 'Biowash Round Neck' — identical fabric (100% Cotton), identical GSM (180), identical style (Round Neck), same legacy category. Importing both would just be the same product twice under different internal names.",
  "Round Neck 111":
    "one of seven near-identical 'Round Neck 11x' SKUs (111–117) differing only in GSM/fabric-supplier micro-variants of the same polyester round-neck line. Consolidated down to two representative entries (114 → Dry-Fit Round Neck, 117 → Value Round Neck) rather than importing all seven as separate catalogue products.",
  "Round Neck 112": "part of the same 'Round Neck 11x' duplicate series — see Round Neck 111's skip reason.",
  "Round Neck 113": "part of the same 'Round Neck 11x' duplicate series — see Round Neck 111's skip reason.",
  "Round Neck 115": "part of the same 'Round Neck 11x' duplicate series — see Round Neck 111's skip reason.",
  "Round Neck 116": "part of the same 'Round Neck 11x' duplicate series — see Round Neck 111's skip reason.",
  "Premium Matti 240 GSM":
    "near-duplicate of 'Premium PC Mattee' (renamed 'Premium Matty Polo T-Shirt') — same 240 GSM poly-cotton piqué polo under a different internal SKU name.",
  "Premium Polo 240 GSM":
    "near-duplicate of 'Premium PC Mattee' (renamed 'Premium Matty Polo T-Shirt') — same 240 GSM poly-cotton polo under a third internal SKU name.",
  "Cotton Terry 210 GSM":
    "near-duplicate of 'Premium Cotton Terry 220 GSM' (renamed 'Premium Terry Oversized T-Shirt') — both are terry-cotton oversized tees 10 GSM apart with the same style/category.",
};

/**
 * Legacy products imported, with the cleaned customer-facing name and the
 * new-schema category slug it routes into. Routing rule: legacy `style`
 * decides Polo T-Shirts vs T-Shirts (the old "Corporate"/"Sports"/
 * "College T-Shirts"/"Custom T-Shirts" categories were internal
 * segmentation, not a customer taxonomy — see the phase report's category
 * mapping section for why they aren't preserved 1:1) — EXCEPT products
 * from the legacy "School Uniforms" category, which route to the new
 * Uniforms category regardless of style, since they're already
 * purpose-built uniform products.
 */
const IMPORT_PLAN = {
  "Biowash Round Neck": { name: "Biowash Round Neck T-Shirt", category: "t-shirts", sortOrder: 1 },
  "Eco Polo Tipping": { name: "Eco Polo T-Shirt", category: "polo-tshirts", sortOrder: 20 },
  "Honeycomb Matty": { name: "Honeycomb Matty Polo T-Shirt", category: "polo-tshirts", sortOrder: 21 },
  "Polo Unisex Premium Sports & Casual Wear": { name: "Premium Sports & Casual T-Shirt", category: "t-shirts", sortOrder: 6 },
  "Premium Micro Polo": { name: "Premium Micro Polo T-Shirt", category: "polo-tshirts", sortOrder: 22 },
  "Premium PC Mattee": { name: "Premium Matty Polo T-Shirt", category: "polo-tshirts", sortOrder: 23 },
  "Premium Tipping Polo": { name: "Premium Tipping Polo T-Shirt", category: "polo-tshirts", sortOrder: 24 },
  "Round Neck Cotton": { name: "Cotton Round Neck T-Shirt (Value)", category: "t-shirts", sortOrder: 2 },
  "Polo Sports": { name: "Dry-Fit Sports T-Shirt", category: "t-shirts", sortOrder: 7 },
  "Sports tee": { name: "Dry-Fit Performance T-Shirt", category: "t-shirts", sortOrder: 8 },
  "PC MATTI 220 GSM": { name: "School Uniform Polo T-Shirt", category: "uniforms", sortOrder: 1 },
  "College Batch Oversized Tee Bio-Wash.": { name: "College Batch Oversized T-Shirt", category: "t-shirts", sortOrder: 9 },
  "Oversized Tee Bio-Wash.": { name: "Oversized T-Shirt", category: "t-shirts", sortOrder: 10 },
  "Premium Cotton Terry 220 GSM": { name: "Premium Terry Oversized T-Shirt", category: "t-shirts", sortOrder: 11 },
  "Kids Round Neck": { name: "Kids Round Neck T-Shirt", category: "t-shirts", sortOrder: 12 },
  "Kids polyester t shirts": { name: "Kids Polyester T-Shirt", category: "t-shirts", sortOrder: 13 },
  "Polo Spun Matty 200 GSM": { name: "Spun Matty Polo T-Shirt", category: "polo-tshirts", sortOrder: 25 },
  "Round Neck 114": { name: "Dry-Fit Round Neck T-Shirt", category: "t-shirts", sortOrder: 14 },
  "Round Neck 117": { name: "Value Round Neck T-Shirt", category: "t-shirts", sortOrder: 15 },
};

/** Legacy category name → tag slug, applied to every imported product from that legacy category. Not every legacy category has a good tag fit (Sports doesn't map cleanly onto the existing tag vocabulary) — left untagged rather than forced. */
const LEGACY_CATEGORY_TAGS = {
  Corporate: ["corporate-teams", "employee-gifting"],
  "College T-Shirts": ["schools-colleges"],
  "School Uniforms": ["schools-colleges"],
  "Custom T-Shirts": ["marketing-campaigns"],
};

module.exports = { SKIP_REASONS, IMPORT_PLAN, LEGACY_CATEGORY_TAGS };
