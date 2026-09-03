/**
 * Product Detail extras, keyed by listing id so homepage/listing records stay
 * unchanged. Missing keys fall back to category templates in getProductDetail.
 */

export const apparelSizes = [
  { id: "s", label: "S" },
  { id: "m", label: "M" },
  { id: "l", label: "L" },
  { id: "xl", label: "XL" },
  { id: "xxl", label: "XXL" },
];

export const apparelSizeGuide = {
  note: "Measurements are approximate and may vary slightly by batch.",
  columns: ["Size", "Chest", "Length"],
  rows: [
    ["S", "36 in", "26 in"],
    ["M", "38 in", "27 in"],
    ["L", "40 in", "28 in"],
    ["XL", "42 in", "29 in"],
    ["XXL", "44 in", "30 in"],
  ],
};

export const hoodieSizeGuide = {
  note: "Measurements are approximate and may vary slightly by batch.",
  columns: ["Size", "Chest", "Length"],
  rows: [
    ["S", "40 in", "26 in"],
    ["M", "42 in", "27 in"],
    ["L", "44 in", "28 in"],
    ["XL", "46 in", "29 in"],
    ["XXL", "48 in", "30 in"],
  ],
};

export const galleryViews = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "detail", label: "Detail" },
  { id: "lifestyle", label: "Branding example" },
];

export const quickQuantities = [10, 25, 50, 100, 250, 500];

/** Per-product overrides. Unlisted products use category defaults. */
export const productDetailOverrides = {
  "cotton-round-neck": {
    description:
      "A everyday corporate tee with a clean round neck and a fabric weight that holds print well. Suitable for teams, events and ongoing staff issue.",
    longSpec: "180 GSM • 100% Cotton • Regular Fit",
    fit: "Regular Fit",
    gender: "Unisex",
    sleeve: "Half Sleeve",
    neck: "Round Neck",
    highlights: [
      "180 GSM",
      "100% Cotton",
      "Bio-Washed",
      "Pre-Shrunk",
      "Unisex Regular Fit",
      "Multiple Colors",
      "Custom Branding Available",
    ],
    specifications: [
      { label: "Fabric", value: "100% Cotton" },
      { label: "GSM", value: "180 GSM" },
      { label: "Fit", value: "Regular Fit" },
      { label: "Gender", value: "Unisex" },
      { label: "Sleeve", value: "Half Sleeve" },
      { label: "Neck", value: "Round Neck" },
      { label: "Sizes", value: "S–XXL" },
      { label: "Customization", value: "Available" },
      { label: "MOQ", value: "5 pieces" },
      { label: "Dispatch", value: "7–10 working days" },
    ],
    relatedProductIds: [
      "oversized-tee",
      "dry-fit-tee",
      "premium-polo",
      "pullover-hoodie",
    ],
    dispatchEstimate: "7–10 working days",
  },
  "oversized-tee": {
    longSpec: "240 GSM • Combed Cotton • Oversized Fit",
    fit: "Oversized",
    neck: "Round Neck",
    relatedProductIds: [
      "cotton-round-neck",
      "slim-fit-tee",
      "dry-fit-tee",
      "pullover-hoodie",
    ],
  },
  "dry-fit-tee": {
    longSpec: "140 GSM • Polyester Mesh • Athletic Fit",
    fit: "Athletic Fit",
    relatedProductIds: [
      "cotton-round-neck",
      "event-cap",
      "drawstring-bag",
      "sipper-bottle",
    ],
  },
  "premium-polo": {
    longSpec: "220 GSM • Pique Cotton • Regular Fit",
    neck: "Polo Collar",
    sleeve: "Half Sleeve",
    relatedProductIds: [
      "cotton-polo",
      "matty-polo",
      "cotton-round-neck",
      "tipped-polo",
    ],
  },
  "corporate-bottle": {
    description:
      "A 750 ml stainless bottle for desks, kits and field teams. Laser mark or print the brand on the body.",
    longSpec: "750 ml • Stainless Steel • Single Wall",
    highlights: [
      "750 ml",
      "Stainless Steel",
      "Leak-resistant lid",
      "Custom branding available",
      "Kit-ready",
    ],
    specifications: [
      { label: "Capacity", value: "750 ml" },
      { label: "Material", value: "Stainless Steel" },
      { label: "Finish", value: "Powder coat" },
      { label: "Customization", value: "Available" },
      { label: "MOQ", value: "50 pieces" },
      { label: "Dispatch", value: "8–12 working days" },
    ],
    relatedProductIds: [
      "sipper-bottle",
      "vacuum-flask",
      "travel-mug",
      "ceramic-mug",
    ],
    dispatchEstimate: "8–12 working days",
  },
  "metal-pen": {
    description:
      "A brass ballpoint for conferences and desk sets. The barrel takes laser engraving cleanly.",
    longSpec: "Brass Body • Laser Engraved • Black Ink",
    highlights: [
      "Brass body",
      "Laser engraving",
      "Smooth ballpoint",
      "Gift-set ready",
    ],
    specifications: [
      { label: "Material", value: "Brass" },
      { label: "Ink", value: "Black ballpoint" },
      { label: "Customization", value: "Laser engraving" },
      { label: "MOQ", value: "100 pieces" },
      { label: "Dispatch", value: "7–10 working days" },
    ],
    relatedProductIds: [
      "bamboo-pen",
      "premium-notebook",
      "executive-diary",
      "lanyard",
    ],
  },
  "welcome-kit": {
    description:
      "A curated onboarding kit. Apparel, desk and drinkware can be branded as a set. Final contents are confirmed in quotation.",
    longSpec: "Apparel • Desk • Drinkware",
    highlights: [
      "Multi-product kit",
      "Custom branding",
      "Flexible contents",
      "Gift-ready packaging",
    ],
    specifications: [
      { label: "Typical contents", value: "Tee, bottle, notebook, pen" },
      { label: "Packaging", value: "Branded box" },
      { label: "Customization", value: "Available on kit items" },
      { label: "MOQ", value: "25 kits" },
      { label: "Dispatch", value: "10–14 working days" },
    ],
    relatedProductIds: [
      "conference-kit",
      "executive-gift-set",
      "cotton-round-neck",
      "corporate-bottle",
    ],
    dispatchEstimate: "10–14 working days",
  },
  "baseball-cap": {
    longSpec: "6-Panel • Cotton Twill • Structured",
    highlights: [
      "Structured 6-panel",
      "Cotton twill",
      "Adjustable strap",
      "Front branding",
    ],
    relatedProductIds: ["event-cap", "cotton-round-neck", "drawstring-bag", "lanyard"],
  },
};
