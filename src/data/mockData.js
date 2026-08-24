/**
 * MOCK DATA — PrimeLinor Design Prototype
 *
 * Every value here is placeholder content for visual design only.
 * Prices, MOQs, ratings, company names and testimonials are invented and
 * must be replaced with real data (eventually served by the backend)
 * before anything ships publicly.
 *
 * `art` keys map to the placeholder illustration set in ui/ProductVisual.
 * Each item also carries an `image` field (null for now) so real photography
 * can be dropped in later without touching any layout code.
 */

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const announcement = [
  "Custom Branding",
  "Flexible Quantities",
  "PAN India Supply",
];

export const primaryNav = [
  { id: "products", label: "Products", href: "/products", hasMegaMenu: true },
  { id: "solutions", label: "Solutions", href: "/solutions" },
  { id: "gifting", label: "Corporate Gifting", href: "/corporate-gifting" },
  { id: "try-logo", label: "Try Your Logo", href: "/#try-your-logo" },
  { id: "about", label: "About", href: "/about" },
];

export const productsMegaMenu = [
  {
    id: "apparel",
    title: "Apparel",
    items: [
      "T-Shirts",
      "Polo T-Shirts",
      "Hoodies & Sweatshirts",
      "Corporate Shirts",
      "Uniforms",
      "Caps",
    ],
  },
  {
    id: "drinkware-bags",
    title: "Drinkware & Bags",
    items: [
      "Bottles",
      "Mugs & Tumblers",
      "Tote Bags",
      "Laptop Bags",
      "Backpacks",
    ],
  },
  {
    id: "stationery",
    title: "Stationery",
    items: ["Notebooks & Diaries", "Pens", "Desk Accessories", "Planners"],
  },
  {
    id: "gifting",
    title: "Gifting & Kits",
    items: [
      "Corporate Gifts",
      "Employee Welcome Kits",
      "Festival Gifting",
      "Conference Kits",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Homepage campaign banners                                           */
/* ------------------------------------------------------------------ */

/**
 * Admin-ready hero campaigns. Replacing a creative is a data change:
 * set `desktopImage` / `mobileImage` to a public path
 * (e.g. "/images/banners/apparel-desktop.webp") or an imported asset.
 *
 * Recommended creative ratios (design banners to match the slot, so
 * object-fit: cover does not crop embedded campaign text):
 *
 *   hero_primary       ~2:1 landscape
 *   hero_secondary_*   ~1.7:1 landscape
 *   mobile primary     ~2:1
 *   mobile secondary   ~1.7:1
 *
 * `title` is an internal/admin name, not rendered over the creative.
 * `altText` is the accessible description of the campaign.
 * `objectPosition` is optional (CSS object-position) for later art direction.
 */
export const heroCampaigns = [
  {
    id: "hero-apparel",
    placement: "hero_primary",
    title: "Premium T-Shirts & Uniforms",
    altText: "PrimeLinor customized T-shirts, polo T-shirts and corporate uniforms",
    desktopImage: null,
    mobileImage: null,
    href: "#products",
    isActive: true,
    sortOrder: 1,
    objectPosition: "center",
  },
  {
    id: "hero-gifting",
    placement: "hero_secondary_1",
    title: "Corporate Gifts",
    altText: "PrimeLinor corporate gifts for teams and clients",
    desktopImage: null,
    mobileImage: null,
    href: "#corporate-gifting",
    isActive: true,
    sortOrder: 2,
    objectPosition: "center",
  },
  {
    id: "hero-kits",
    placement: "hero_secondary_2",
    title: "Employee Welcome Kits",
    altText: "PrimeLinor employee welcome kits and onboarding gifts",
    desktopImage: null,
    mobileImage: null,
    href: "#solutions",
    isActive: true,
    sortOrder: 3,
    objectPosition: "center",
  },
];

/* ------------------------------------------------------------------ */
/* What are you creating today?                                        */
/* ------------------------------------------------------------------ */

export const creationTypes = [
  {
    id: "apparel",
    title: "Apparel",
    description: "T-shirts, polos, hoodies and uniforms.",
    art: "tshirt",
    color: "#e3e6eb",
    image: null,
  },
  {
    id: "corporate-gifts",
    title: "Corporate Gifts",
    description: "Premium gifts for teams and clients.",
    art: "giftbox",
    color: "#22304a",
    image: null,
  },
  {
    id: "events",
    title: "Events & Promotions",
    description: "Merchandise that travels well.",
    art: "cap",
    color: "#2b2b33",
    image: null,
  },
  {
    id: "kits",
    title: "Corporate Kits",
    description: "Curated multi-product kits.",
    art: "kit",
    color: "#e3ddd0",
    image: null,
  },
];

/* ------------------------------------------------------------------ */
/* Shop by category                                                    */
/* ------------------------------------------------------------------ */

export const categories = [
  { id: "tshirts", name: "T-Shirts", art: "tshirt", color: "#e3e6eb", image: null },
  { id: "polo", name: "Polo T-Shirts", art: "polo", color: "#22304a", image: null },
  { id: "bags", name: "Bags", art: "tote", color: "#e3ddd0", image: null },
  { id: "bottles", name: "Bottles & Drinkware", art: "bottle", color: "#dfe3e8", image: null },
  { id: "notebooks", name: "Notebooks & Diaries", art: "notebook", color: "#2b2b33", image: null },
  { id: "promotional", name: "Promotional Products", art: "pen", color: "#22304a", image: null },
  { id: "corporate-gifts", name: "Corporate Gifts", art: "giftbox", color: "#3c4a63", image: null },
  { id: "gift-kits", name: "Gift Kits", art: "kit", color: "#dde1e8", image: null },
];

/* ------------------------------------------------------------------ */
/* Try Your Logo — homepage demo                                       */
/* ------------------------------------------------------------------ */

export const productColors = {
  white: { label: "White", hex: "#e8eaee" },
  navy: { label: "Navy", hex: "#22304a" },
  charcoal: { label: "Charcoal", hex: "#2b2b33" },
  melange: { label: "Grey Melange", hex: "#c3c7ce" },
  sand: { label: "Sand", hex: "#e3ddd0" },
  maroon: { label: "Maroon", hex: "#5c2733" },
};

/**
 * Placement vocabulary, shared by every customizable product.
 *
 * Names come from the WEARER's perspective, the apparel industry convention.
 * On a front-facing garment that mirrors, so the wearer's left chest is drawn
 * on the viewer's right (`cx` above 50 in the zone data below).
 *
 * `view` decides which side of the garment the mockup renders, so a back
 * placement is previewed on an actual back view rather than being claimed
 * over a front-facing illustration.
 */
export const printPlacements = {
  "left-chest": { label: "Wearer's Left Chest", view: "front" },
  "right-chest": { label: "Wearer's Right Chest", view: "front" },
  "front-center": { label: "Front Center", view: "front" },
  "back-upper": { label: "Upper Back", view: "back" },
  "back-center": { label: "Back Center", view: "back" },
  sleeve: { label: "Sleeve (wearer's right)", view: "front" },
};

export const viewLabels = { front: "Front view", back: "Back view" };

/**
 * Print zones, in percentages of the GarmentMockup surface.
 *
 *   cx / cy  centre of the print area
 *   w  / h   maximum artwork box; uploaded art is contained inside it, so a
 *            logo is never stretched and never spills past the zone
 *
 * Sizes follow realistic print dimensions rather than whatever fills the
 * space: chest and sleeve marks stay small, front and back prints are large.
 * The order of the keys is the order the placement chips render in.
 */
export const customizableProducts = [
  {
    id: "tshirt",
    name: "Round Neck T-Shirt",
    mockup: "tshirt",
    colors: ["white", "navy", "charcoal", "melange", "sand", "maroon"],
    zones: {
      "left-chest": { cx: 62.5, cy: 34, w: 8, h: 5 },
      "right-chest": { cx: 37.5, cy: 34, w: 8, h: 5 },
      "front-center": { cx: 50, cy: 46, w: 22, h: 16 },
      "back-center": { cx: 50, cy: 41, w: 26, h: 18 },
      sleeve: { cx: 18, cy: 36, w: 6.5, h: 4 },
    },
  },
  {
    id: "polo",
    name: "Polo T-Shirt",
    mockup: "polo",
    colors: ["white", "navy", "charcoal", "melange", "sand", "maroon"],
    zones: {
      // sits beside the placket, not on it, and clear of the armhole
      "left-chest": { cx: 66.5, cy: 38.5, w: 7.5, h: 5 },
      "right-chest": { cx: 33.5, cy: 38.5, w: 7.5, h: 5 },
      "front-center": { cx: 50, cy: 58, w: 18, h: 13 },
      "back-center": { cx: 50, cy: 41, w: 24, h: 17 },
      sleeve: { cx: 18, cy: 36, w: 6.5, h: 4 },
    },
  },
  {
    id: "hoodie",
    name: "Hoodie",
    mockup: "hoodie",
    colors: ["navy", "charcoal", "melange", "sand", "maroon", "white"],
    zones: {
      "left-chest": { cx: 61, cy: 43.5, w: 7.5, h: 5 },
      "right-chest": { cx: 39, cy: 43.5, w: 7.5, h: 5 },
      // sits between the drawcords and the top of the pocket
      "front-center": { cx: 50, cy: 50.5, w: 18, h: 12 },
      "back-center": { cx: 50, cy: 44, w: 24, h: 16 },
      sleeve: { cx: 19, cy: 42, w: 6.5, h: 4 },
    },
  },
  {
    id: "tote",
    name: "Tote Bag",
    mockup: "tote",
    colors: ["sand", "white", "navy", "charcoal"],
    zones: {
      "front-center": { cx: 50, cy: 63.6, w: 30, h: 22 },
      "back-center": { cx: 50, cy: 63.6, w: 30, h: 22 },
    },
  },
];

/* ------------------------------------------------------------------ */
/* Catalogue — homepage product explorer                               */
/* ------------------------------------------------------------------ */

/**
 * Stands in for what the Product Listing page will eventually serve.
 * The explorer pages through this locally; only the current page is rendered.
 * Pricing model is unchanged: `tiered` products show their first slab and the
 * slab range as a note, `fixed` shows one price, `quote` shows nothing yet.
 */
export const catalogueProducts = [
  {
    id: "cotton-round-neck",
    name: "Premium Cotton Round Neck T-Shirt",
    spec: "180 GSM • 100% Cotton",
    art: "tshirt",
    color: "#e3e6eb",
    image: null,
    priceType: "tiered",
    price: 149,
    priceNote: "for 5–49 pieces",
    moq: 5,
    unit: "piece",
    tiers: [
      { from: 5, to: 49, price: 149 },
      { from: 50, to: 499, price: 145 },
      { from: 500, to: 4999, price: 139 },
      { from: 5000, to: null, price: null },
    ],
  },
  {
    id: "oversized-tee",
    name: "Oversized Drop Shoulder T-Shirt",
    spec: "240 GSM • Combed Cotton",
    art: "tshirt",
    color: "#2b2b33",
    image: null,
    priceType: "tiered",
    price: 299,
    priceNote: "for 10–99 pieces",
    moq: 10,
    unit: "piece",
    tiers: [
      { from: 10, to: 99, price: 299 },
      { from: 100, to: 999, price: 285 },
      { from: 1000, to: null, price: 269 },
    ],
  },
  {
    id: "dry-fit-tee",
    name: "Dry-Fit Sports T-Shirt",
    spec: "140 GSM • Polyester Mesh",
    art: "tshirt",
    color: "#22304a",
    image: null,
    priceType: "tiered",
    price: 219,
    priceNote: "for 20–199 pieces",
    moq: 20,
    unit: "piece",
    tiers: [
      { from: 20, to: 199, price: 219 },
      { from: 200, to: 1999, price: 205 },
      { from: 2000, to: null, price: 189 },
    ],
  },
  {
    id: "premium-polo",
    name: "Premium Polo T-Shirt",
    spec: "220 GSM • Pique Cotton",
    art: "polo",
    color: "#22304a",
    image: null,
    priceType: "tiered",
    price: 329,
    priceNote: "for 10–99 pieces",
    moq: 10,
    unit: "piece",
    tiers: [
      { from: 10, to: 99, price: 329 },
      { from: 100, to: 999, price: 315 },
      { from: 1000, to: null, price: 299 },
    ],
  },
  {
    id: "tipped-polo",
    name: "Tipped Collar Polo T-Shirt",
    spec: "240 GSM • Matty Cotton",
    art: "polo",
    color: "#5c2733",
    image: null,
    priceType: "tiered",
    price: 389,
    priceNote: "for 15–149 pieces",
    moq: 15,
    unit: "piece",
    tiers: [
      { from: 15, to: 149, price: 389 },
      { from: 150, to: null, price: 365 },
    ],
  },
  {
    id: "pullover-hoodie",
    name: "Fleece Pullover Hoodie",
    spec: "320 GSM • Brushed Fleece",
    art: "hoodie",
    color: "#3c4a63",
    image: null,
    priceType: "tiered",
    price: 749,
    priceNote: "for 10–99 pieces",
    moq: 10,
    unit: "piece",
    tiers: [
      { from: 10, to: 99, price: 749 },
      { from: 100, to: null, price: 699 },
    ],
  },
  {
    id: "zip-sweatshirt",
    name: "Zip-Up Sweatshirt",
    spec: "330 GSM • Cotton Blend",
    art: "hoodie",
    color: "#2b2b33",
    image: null,
    priceType: "fixed",
    price: 899,
    priceNote: null,
    moq: 10,
    unit: "piece",
    tiers: null,
  },
  {
    id: "baseball-cap",
    name: "Structured Baseball Cap",
    spec: "6-Panel • Cotton Twill",
    art: "cap",
    color: "#22304a",
    image: null,
    priceType: "fixed",
    price: 189,
    priceNote: null,
    moq: 25,
    unit: "piece",
    tiers: null,
  },
  {
    id: "canvas-tote",
    name: "Canvas Tote Bag",
    spec: "12 oz • Natural Canvas",
    art: "tote",
    color: "#e3ddd0",
    image: null,
    priceType: "tiered",
    price: 159,
    priceNote: "for 25–249 pieces",
    moq: 25,
    unit: "piece",
    tiers: [
      { from: 25, to: 249, price: 159 },
      { from: 250, to: null, price: 145 },
    ],
  },
  {
    id: "jute-conference-bag",
    name: "Jute Conference Bag",
    spec: "Laminated Jute • A4 Fit",
    art: "tote",
    color: "#b9a888",
    image: null,
    priceType: "fixed",
    price: 249,
    priceNote: null,
    moq: 50,
    unit: "piece",
    tiers: null,
  },
  {
    id: "laptop-backpack",
    name: "Laptop Backpack",
    spec: "15.6\" • Water Resistant",
    art: "backpack",
    color: "#2b2b33",
    image: null,
    priceType: "fixed",
    price: 1249,
    priceNote: null,
    moq: 20,
    unit: "piece",
    tiers: null,
  },
  {
    id: "drawstring-bag",
    name: "Drawstring Sports Bag",
    spec: "210D Polyester",
    art: "backpack",
    color: "#22304a",
    image: null,
    priceType: "fixed",
    price: 129,
    priceNote: null,
    moq: 50,
    unit: "piece",
    tiers: null,
  },
  {
    id: "corporate-bottle",
    name: "Custom Corporate Bottle",
    spec: "750 ml • Stainless Steel",
    art: "bottle",
    color: "#dfe3e8",
    image: null,
    priceType: "fixed",
    price: 449,
    priceNote: null,
    moq: 50,
    unit: "piece",
    tiers: null,
  },
  {
    id: "vacuum-flask",
    name: "Vacuum Insulated Flask",
    spec: "500 ml • 12 Hour Hot",
    art: "bottle",
    color: "#3c4a63",
    image: null,
    priceType: "tiered",
    price: 699,
    priceNote: "for 25–249 pieces",
    moq: 25,
    unit: "piece",
    tiers: [
      { from: 25, to: 249, price: 699 },
      { from: 250, to: null, price: 649 },
    ],
  },
  {
    id: "ceramic-mug",
    name: "Ceramic Coffee Mug",
    spec: "330 ml • Dishwasher Safe",
    art: "mug",
    color: "#e8eaee",
    image: null,
    priceType: "fixed",
    price: 199,
    priceNote: null,
    moq: 50,
    unit: "piece",
    tiers: null,
  },
  {
    id: "travel-mug",
    name: "Stainless Travel Mug",
    spec: "400 ml • Spill Resistant",
    art: "mug",
    color: "#2b2b33",
    image: null,
    priceType: "fixed",
    price: 379,
    priceNote: null,
    moq: 50,
    unit: "piece",
    tiers: null,
  },
  {
    id: "premium-notebook",
    name: "Premium Hardbound Notebook",
    spec: "A5 • 160 Pages",
    art: "notebook",
    color: "#2b2b33",
    image: null,
    priceType: "fixed",
    price: 239,
    priceNote: null,
    moq: 100,
    unit: "piece",
    tiers: null,
  },
  {
    id: "executive-diary",
    name: "A5 Executive Diary",
    spec: "PU Cover • Dated Pages",
    art: "notebook",
    color: "#5c2733",
    image: null,
    priceType: "tiered",
    price: 329,
    priceNote: "for 50–499 pieces",
    moq: 50,
    unit: "piece",
    tiers: [
      { from: 50, to: 499, price: 329 },
      { from: 500, to: null, price: 299 },
    ],
  },
  {
    id: "metal-pen",
    name: "Metal Ballpoint Pen",
    spec: "Brass Body • Laser Engraved",
    art: "pen",
    color: "#22304a",
    image: null,
    priceType: "fixed",
    price: 89,
    priceNote: null,
    moq: 100,
    unit: "piece",
    tiers: null,
  },
  {
    id: "bamboo-pen",
    name: "Bamboo Eco Pen",
    spec: "Recycled • Natural Finish",
    art: "pen",
    color: "#b9a888",
    image: null,
    priceType: "tiered",
    price: 49,
    priceNote: "for 250–999 pieces",
    moq: 250,
    unit: "piece",
    tiers: [
      { from: 250, to: 999, price: 49 },
      { from: 1000, to: null, price: 42 },
    ],
  },
  {
    id: "executive-gift-set",
    name: "Executive Gift Set",
    spec: "Diary • Pen • Bottle",
    art: "giftbox",
    color: "#3c4a63",
    image: null,
    priceType: "quote",
    price: null,
    priceNote: null,
    moq: 25,
    unit: "set",
    tiers: null,
  },
  {
    id: "festival-hamper",
    name: "Festival Gift Hamper",
    spec: "Custom Curated • Boxed",
    art: "giftbox",
    color: "#5c2733",
    image: null,
    priceType: "quote",
    price: null,
    priceNote: null,
    moq: 50,
    unit: "hamper",
    tiers: null,
  },
  {
    id: "welcome-kit",
    name: "Employee Welcome Kit",
    spec: "Apparel • Desk • Drinkware",
    art: "kit",
    color: "#e3ddd0",
    image: null,
    priceType: "quote",
    price: null,
    priceNote: null,
    moq: 25,
    unit: "kit",
    tiers: null,
  },
  {
    id: "conference-kit",
    name: "Conference Welcome Kit",
    spec: "Bag • Notebook • Badge",
    art: "kit",
    color: "#c3c7ce",
    image: null,
    priceType: "quote",
    price: null,
    priceNote: null,
    moq: 100,
    unit: "kit",
    tiers: null,
  },
];

/** Cards shown per page of the homepage explorer (3 desktop rows of 4). */
export const explorerPageSize = 12;
/** Two-up mobile shows three compact rows instead of a long wall of cards. */
export const explorerMobilePageSize = 6;

/* ------------------------------------------------------------------ */
/* Product listing — filter metadata + extra catalogue rows            */
/* ------------------------------------------------------------------ */

/**
 * Listing-only fields, keyed by catalogue id so the homepage explorer can
 * keep rendering the original records without visual change. The listing
 * page merges these on read.
 */
export const listingMeta = {
  "cotton-round-neck": {
    category: "tshirts",
    material: "cotton",
    gsm: 180,
    colors: ["white", "navy", "charcoal", "melange", "sand"],
    useCases: ["corporate-teams", "events"],
    customizable: true,
    recommended: 1,
    added: 24,
  },
  "oversized-tee": {
    category: "tshirts",
    material: "cotton",
    gsm: 240,
    colors: ["charcoal", "white", "navy"],
    useCases: ["events", "schools"],
    customizable: true,
    recommended: 2,
    added: 23,
  },
  "dry-fit-tee": {
    category: "tshirts",
    material: "polyester",
    gsm: 140,
    colors: ["navy", "charcoal", "white", "maroon"],
    useCases: ["events", "promotional"],
    customizable: true,
    recommended: 3,
    added: 18,
  },
  "premium-polo": {
    category: "polo",
    material: "cotton",
    gsm: 220,
    colors: ["navy", "white", "charcoal", "maroon", "sand"],
    useCases: ["corporate-teams"],
    customizable: true,
    recommended: 4,
    added: 22,
  },
  "tipped-polo": {
    category: "polo",
    material: "matty",
    gsm: 240,
    colors: ["maroon", "navy", "white"],
    useCases: ["corporate-teams", "events"],
    customizable: true,
    recommended: 5,
    added: 16,
  },
  "pullover-hoodie": {
    category: "hoodies",
    material: "fleece",
    gsm: 320,
    colors: ["navy", "charcoal", "maroon", "melange"],
    useCases: ["schools", "corporate-teams"],
    customizable: true,
    recommended: 6,
    added: 21,
  },
  "zip-sweatshirt": {
    category: "hoodies",
    material: "cotton-blend",
    gsm: 330,
    colors: ["charcoal", "navy"],
    useCases: ["corporate-teams"],
    customizable: true,
    recommended: 7,
    added: 14,
  },
  "baseball-cap": {
    category: "caps",
    material: "cotton",
    gsm: null,
    colors: ["navy", "charcoal", "white"],
    useCases: ["events", "promotional"],
    customizable: true,
    recommended: 8,
    added: 20,
  },
  "canvas-tote": {
    category: "bags",
    material: "canvas",
    gsm: null,
    colors: ["sand", "navy", "charcoal"],
    useCases: ["events", "promotional"],
    customizable: true,
    recommended: 9,
    added: 19,
  },
  "jute-conference-bag": {
    category: "bags",
    material: "jute",
    gsm: null,
    colors: ["sand", "navy"],
    useCases: ["events", "corporate-teams"],
    customizable: true,
    recommended: 10,
    added: 11,
  },
  "laptop-backpack": {
    category: "bags",
    material: "polyester",
    gsm: null,
    colors: ["charcoal", "navy"],
    useCases: ["corporate-teams"],
    customizable: true,
    recommended: 11,
    added: 13,
  },
  "drawstring-bag": {
    category: "bags",
    material: "polyester",
    gsm: null,
    colors: ["navy", "charcoal", "maroon"],
    useCases: ["events", "schools"],
    customizable: true,
    recommended: 12,
    added: 9,
  },
  "corporate-bottle": {
    category: "bottles",
    material: "stainless",
    gsm: null,
    colors: ["white", "navy", "charcoal"],
    useCases: ["corporate-teams", "employee-gifting"],
    customizable: true,
    recommended: 13,
    added: 17,
  },
  "vacuum-flask": {
    category: "bottles",
    material: "stainless",
    gsm: null,
    colors: ["navy", "charcoal", "maroon"],
    useCases: ["corporate-teams"],
    customizable: true,
    recommended: 14,
    added: 8,
  },
  "ceramic-mug": {
    category: "bottles",
    material: "ceramic",
    gsm: null,
    colors: ["white", "navy", "maroon"],
    useCases: ["corporate-teams", "employee-gifting"],
    customizable: true,
    recommended: 15,
    added: 15,
  },
  "travel-mug": {
    category: "bottles",
    material: "stainless",
    gsm: null,
    colors: ["charcoal", "navy"],
    useCases: ["corporate-teams"],
    customizable: true,
    recommended: 16,
    added: 7,
  },
  "premium-notebook": {
    category: "notebooks",
    material: "pu",
    gsm: null,
    colors: ["charcoal", "navy", "maroon"],
    useCases: ["corporate-teams", "events"],
    customizable: true,
    recommended: 17,
    added: 12,
  },
  "executive-diary": {
    category: "notebooks",
    material: "pu",
    gsm: null,
    colors: ["maroon", "navy", "charcoal"],
    useCases: ["corporate-teams", "employee-gifting"],
    customizable: true,
    recommended: 18,
    added: 6,
  },
  "metal-pen": {
    category: "pens",
    material: "metal",
    gsm: null,
    colors: ["navy", "charcoal"],
    useCases: ["promotional", "corporate-teams"],
    customizable: true,
    recommended: 19,
    added: 10,
  },
  "bamboo-pen": {
    category: "pens",
    material: "bamboo",
    gsm: null,
    colors: ["sand"],
    useCases: ["promotional", "events"],
    customizable: true,
    recommended: 20,
    added: 5,
  },
  "executive-gift-set": {
    category: "gifts",
    material: "mixed",
    gsm: null,
    colors: ["navy", "charcoal"],
    useCases: ["employee-gifting", "corporate-teams"],
    customizable: true,
    recommended: 21,
    added: 4,
  },
  "festival-hamper": {
    category: "gifts",
    material: "mixed",
    gsm: null,
    colors: ["maroon", "sand"],
    useCases: ["employee-gifting"],
    customizable: true,
    recommended: 22,
    added: 3,
  },
  "welcome-kit": {
    category: "kits",
    material: "mixed",
    gsm: null,
    colors: ["sand", "navy"],
    useCases: ["employee-gifting", "corporate-teams"],
    customizable: true,
    recommended: 23,
    added: 2,
  },
  "conference-kit": {
    category: "kits",
    material: "mixed",
    gsm: null,
    colors: ["melange", "navy"],
    useCases: ["events", "corporate-teams"],
    customizable: true,
    recommended: 24,
    added: 1,
  },
};

export const extraListingProducts = [
  {
    id: "cotton-polo",
    name: "Cotton Polo T-Shirt",
    spec: "200 GSM • 100% Cotton",
    art: "polo",
    color: "#e3e6eb",
    image: null,
    priceType: "tiered",
    price: 279,
    priceNote: "for 10–99 pieces",
    moq: 10,
    unit: "piece",
    tiers: [
      { from: 10, to: 99, price: 279 },
      { from: 100, to: null, price: 259 },
    ],
    category: "polo",
    material: "cotton",
    gsm: 200,
    colors: ["white", "navy", "sand", "charcoal"],
    useCases: ["corporate-teams", "schools"],
    customizable: true,
    recommended: 25,
    added: 28,
  },
  {
    id: "matty-polo",
    name: "Matty Polo T-Shirt",
    spec: "260 GSM • Matty Knit",
    art: "polo",
    color: "#22304a",
    image: null,
    priceType: "tiered",
    price: 359,
    priceNote: "for 15–99 pieces",
    moq: 15,
    unit: "piece",
    tiers: [
      { from: 15, to: 99, price: 359 },
      { from: 100, to: null, price: 339 },
    ],
    category: "polo",
    material: "matty",
    gsm: 260,
    colors: ["navy", "white", "maroon"],
    useCases: ["corporate-teams"],
    customizable: true,
    recommended: 26,
    added: 27,
  },
  {
    id: "event-cap",
    name: "Event Cap",
    spec: "5-Panel • Unstructured",
    art: "cap",
    color: "#2b2b33",
    image: null,
    priceType: "fixed",
    price: 149,
    priceNote: null,
    moq: 50,
    unit: "piece",
    tiers: null,
    category: "caps",
    material: "cotton",
    gsm: null,
    colors: ["charcoal", "navy", "white", "maroon"],
    useCases: ["events", "promotional"],
    customizable: true,
    recommended: 27,
    added: 26,
  },
  {
    id: "sipper-bottle",
    name: "Sipper Bottle",
    spec: "600 ml • Tritan",
    art: "bottle",
    color: "#dfe3e8",
    image: null,
    priceType: "fixed",
    price: 229,
    priceNote: null,
    moq: 50,
    unit: "piece",
    tiers: null,
    category: "bottles",
    material: "polyester",
    gsm: null,
    colors: ["white", "navy", "charcoal"],
    useCases: ["events", "promotional", "schools"],
    customizable: true,
    recommended: 28,
    added: 25,
  },
  {
    id: "promotional-badge",
    name: "Promotional Badge",
    spec: "58 mm • Pin Back",
    art: "pen",
    color: "#22304a",
    image: null,
    priceType: "tiered",
    price: 19,
    priceNote: "for 100–499 pieces",
    moq: 100,
    unit: "piece",
    tiers: [
      { from: 100, to: 499, price: 19 },
      { from: 500, to: null, price: 14 },
    ],
    category: "promotional",
    material: "metal",
    gsm: null,
    colors: ["navy", "white"],
    useCases: ["promotional", "events"],
    customizable: true,
    recommended: 29,
    added: 32,
  },
  {
    id: "lanyard",
    name: "Printed Lanyard",
    spec: "20 mm • Polyester",
    art: "pen",
    color: "#5c2733",
    image: null,
    priceType: "fixed",
    price: 39,
    priceNote: null,
    moq: 100,
    unit: "piece",
    tiers: null,
    category: "promotional",
    material: "polyester",
    gsm: null,
    colors: ["maroon", "navy", "charcoal"],
    useCases: ["events", "promotional", "schools"],
    customizable: true,
    recommended: 30,
    added: 31,
  },
  {
    id: "festival-gift-box",
    name: "Festival Gift Box",
    spec: "Assorted • Ribbon Finish",
    art: "giftbox",
    color: "#e3ddd0",
    image: null,
    priceType: "quote",
    price: null,
    priceNote: null,
    moq: 25,
    unit: "box",
    tiers: null,
    category: "gifts",
    material: "mixed",
    gsm: null,
    colors: ["sand", "maroon"],
    useCases: ["employee-gifting"],
    customizable: true,
    recommended: 31,
    added: 30,
  },
  {
    id: "slim-fit-tee",
    name: "Slim Fit Round Neck T-Shirt",
    spec: "160 GSM • Combed Cotton",
    art: "tshirt",
    color: "#c3c7ce",
    image: null,
    priceType: "tiered",
    price: 169,
    priceNote: "for 5–49 pieces",
    moq: 5,
    unit: "piece",
    tiers: [
      { from: 5, to: 49, price: 169 },
      { from: 50, to: null, price: 155 },
    ],
    category: "tshirts",
    material: "cotton",
    gsm: 160,
    colors: ["melange", "navy", "white", "charcoal"],
    useCases: ["corporate-teams", "promotional"],
    customizable: true,
    recommended: 32,
    added: 29,
  },
];

export const listingProducts = [
  ...catalogueProducts.map((product) => ({
    ...product,
    ...(listingMeta[product.id] || {}),
  })),
  ...extraListingProducts,
];

export const listingPageSize = 12;

export const listingCategories = [
  { id: "all", label: "All Products" },
  { id: "tshirts", label: "T-Shirts" },
  { id: "polo", label: "Polo T-Shirts" },
  { id: "hoodies", label: "Hoodies" },
  { id: "caps", label: "Caps" },
  { id: "bags", label: "Bags" },
  { id: "bottles", label: "Bottles & Drinkware" },
  { id: "pens", label: "Pens" },
  { id: "notebooks", label: "Notebooks & Diaries" },
  { id: "gifts", label: "Corporate Gifts" },
  { id: "kits", label: "Gift Kits" },
  { id: "promotional", label: "Promotional Products" },
];

export const listingMegaCategory = {
  "T-Shirts": "tshirts",
  "Polo T-Shirts": "polo",
  "Hoodies & Sweatshirts": "hoodies",
  "Corporate Shirts": "polo",
  Uniforms: "tshirts",
  Caps: "caps",
  Bottles: "bottles",
  "Mugs & Tumblers": "bottles",
  "Tote Bags": "bags",
  "Laptop Bags": "bags",
  Backpacks: "bags",
  "Notebooks & Diaries": "notebooks",
  Pens: "pens",
  "Desk Accessories": "promotional",
  Planners: "notebooks",
  "Corporate Gifts": "gifts",
  "Employee Welcome Kits": "kits",
  "Festival Gifting": "gifts",
  "Conference Kits": "kits",
};

export const listingFilterOptions = {
  materials: [
    { id: "cotton", label: "Cotton" },
    { id: "polyester", label: "Polyester" },
    { id: "cotton-blend", label: "Cotton Blend" },
    { id: "matty", label: "Matty" },
    { id: "fleece", label: "Fleece" },
    { id: "canvas", label: "Canvas" },
    { id: "jute", label: "Jute" },
    { id: "stainless", label: "Stainless Steel" },
    { id: "ceramic", label: "Ceramic" },
    { id: "metal", label: "Metal" },
    { id: "bamboo", label: "Bamboo" },
    { id: "pu", label: "PU / Leatherette" },
    { id: "mixed", label: "Mixed materials" },
  ],
  gsm: [
    { id: "under-160", label: "Under 160 GSM", min: 0, max: 159 },
    { id: "160-199", label: "160–199 GSM", min: 160, max: 199 },
    { id: "200-239", label: "200–239 GSM", min: 200, max: 239 },
    { id: "240-plus", label: "240 GSM+", min: 240, max: null },
  ],
  moq: [
    { id: "1-10", label: "1–10", min: 1, max: 10 },
    { id: "11-25", label: "11–25", min: 11, max: 25 },
    { id: "26-50", label: "26–50", min: 26, max: 50 },
    { id: "51-100", label: "51–100", min: 51, max: 100 },
    { id: "100-plus", label: "100+", min: 100, max: null },
  ],
  price: [
    { id: "under-200", label: "Under ₹200", min: 0, max: 199 },
    { id: "200-499", label: "₹200–₹499", min: 200, max: 499 },
    { id: "500-999", label: "₹500–₹999", min: 500, max: 999 },
    { id: "1000-plus", label: "₹1,000+", min: 1000, max: null },
    { id: "quote", label: "Price on request", quote: true },
  ],
  useCases: [
    { id: "corporate-teams", label: "Corporate Teams" },
    { id: "events", label: "Events" },
    { id: "schools", label: "Schools & Colleges" },
    { id: "promotional", label: "Promotional Campaigns" },
    { id: "employee-gifting", label: "Employee Gifting" },
  ],
};

export const listingSortOptions = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "moq-asc", label: "MOQ: Low to High" },
  { id: "newest", label: "Newest" },
];

/* ------------------------------------------------------------------ */
/* Made for your business                                              */
/* ------------------------------------------------------------------ */

export const businessUseCases = [
  {
    id: "corporate-teams",
    title: "Corporate Teams",
    description: "Branded apparel and desk essentials for large teams.",
    art: "polo",
    color: "#22304a",
    image: null,
    solutionSlug: "corporate-teams",
  },
  {
    id: "startups",
    title: "Startups",
    description: "Small batches to launch your brand without overcommitting.",
    art: "tshirt",
    color: "#e3e6eb",
    image: null,
    solutionSlug: "startups",
  },
  {
    id: "events",
    title: "Events",
    description: "Merchandise and giveaways ready before your event date.",
    art: "cap",
    color: "#2b2b33",
    image: null,
    solutionSlug: "events-conferences",
  },
  {
    id: "schools",
    title: "Schools & Colleges",
    description: "Uniforms, fest merchandise and department kits.",
    art: "hoodie",
    color: "#3c4a63",
    image: null,
    solutionSlug: "schools-colleges",
  },
  {
    id: "marketing",
    title: "Marketing Campaigns",
    description: "Promotional products that keep your brand in hand.",
    art: "pen",
    color: "#22304a",
    image: null,
    solutionSlug: "marketing-campaigns",
  },
  {
    id: "employee-gifting",
    title: "Employee Gifting",
    description: "Welcome kits, milestones and festival gifting.",
    art: "kit",
    color: "#e3ddd0",
    image: null,
    solutionSlug: "employee-gifting",
  },
];

/* ------------------------------------------------------------------ */
/* Corporate gifting                                                   */
/* ------------------------------------------------------------------ */

export const giftingCollections = [
  {
    id: "welcome-kits",
    title: "Employee Welcome Kits",
    description: "Make day one feel considered.",
    art: "kit",
    color: "#e3ddd0",
    image: null,
  },
  {
    id: "festival",
    title: "Festival Gifting",
    description: "Seasonal gifting at team scale.",
    art: "giftbox",
    color: "#5c2733",
    image: null,
  },
  {
    id: "conference",
    title: "Conference Kits",
    description: "Everything an attendee needs.",
    art: "tote",
    color: "#22304a",
    image: null,
  },
  {
    id: "client-gifts",
    title: "Client Gifts",
    description: "Premium pieces worth keeping.",
    art: "notebook",
    color: "#2b2b33",
    image: null,
  },
];

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

export const howItWorks = [
  { id: 1, title: "Choose", description: "Pick a product that fits your brand." },
  { id: 2, title: "Customize", description: "Add your logo, colour and placement." },
  { id: 3, title: "Preview", description: "See the branding before you commit." },
  { id: 4, title: "Request Quote", description: "Share quantity and delivery city." },
  { id: 5, title: "Order", description: "Confirm and we produce and deliver." },
];

/* ------------------------------------------------------------------ */
/* Trust — all placeholder, replace with verified data                 */
/* ------------------------------------------------------------------ */

export const trust = {
  rating: {
    source: "Google Reviews",
    value: null, // placeholder — connect to real reviews
    label: "Verified rating and reviews will appear here once our Google listing is connected.",
  },
  companies: ["Logo 1", "Logo 2", "Logo 3", "Logo 4", "Logo 5", "Logo 6"],
  /**
   * Reserved slots, not sample quotes. `quote` stays null until a verified
   * customer story is supplied; TrustSection renders the real testimonial
   * automatically once quote/name/company are filled in.
   */
  testimonials: [
    { id: "t1", context: "Employee welcome kits", quote: null, name: null, role: null, company: null },
    { id: "t2", context: "Event and conference merchandise", quote: null, name: null, role: null, company: null },
    { id: "t3", context: "Festival and client gifting", quote: null, name: null, role: null, company: null },
  ],
  gallery: [
    { id: "g1", art: "tshirt", color: "#22304a", label: "Completed order photo placeholder", image: null },
    { id: "g2", art: "bottle", color: "#2b2b33", label: "Completed order photo placeholder", image: null },
    { id: "g3", art: "kit", color: "#e3ddd0", label: "Completed order photo placeholder", image: null },
    { id: "g4", art: "notebook", color: "#5c2733", label: "Completed order photo placeholder", image: null },
  ],
};

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export const footerColumns = [
  {
    id: "products",
    title: "Products",
    links: [
      "T-Shirts",
      "Polo T-Shirts",
      "Hoodies",
      "Bags",
      "Bottles & Drinkware",
      "Notebooks & Diaries",
      "Promotional Products",
    ],
  },
  {
    id: "solutions",
    title: "Solutions",
    links: [
      "Corporate Teams",
      "Startups",
      "Events",
      "Schools & Colleges",
      "Marketing Campaigns",
      "Employee Gifting",
    ],
  },
  {
    id: "gifting",
    title: "Corporate Gifting",
    links: [
      "Employee Welcome Kits",
      "Festival Gifting",
      "Conference Kits",
      "Client Gifts",
      "Build Your Kit",
    ],
  },
  {
    id: "resources",
    title: "Resources",
    links: [
      "Try Your Logo",
      "How It Works",
      "Sizing & Specifications",
      "Artwork Guidelines",
      "Delivery Timelines",
    ],
  },
  {
    id: "company",
    title: "Company",
    links: ["About PrimeLinor", "Our Process", "Quality", "Careers", "Contact"],
  },
];

/**
 * Real destinations for footer links, keyed by the visible label. A label
 * missing from this map stays a dead "#top" placeholder in Footer.jsx —
 * intentional: only link labels with a real page behind them are wired.
 */
export const footerLinkRoutes = {
  "T-Shirts": "/products",
  "Polo T-Shirts": "/products",
  Hoodies: "/products",
  Bags: "/products",
  "Bottles & Drinkware": "/products",
  "Notebooks & Diaries": "/products",
  "Promotional Products": "/products",

  "Corporate Teams": "/solutions/corporate-teams",
  Startups: "/solutions/startups",
  Events: "/solutions/events-conferences",
  "Schools & Colleges": "/solutions/schools-colleges",
  "Marketing Campaigns": "/solutions/marketing-campaigns",
  "Employee Gifting": "/solutions/employee-gifting",

  "Employee Welcome Kits": "/corporate-gifting",
  "Festival Gifting": "/corporate-gifting",
  "Conference Kits": "/corporate-gifting",
  "Client Gifts": "/corporate-gifting",
  "Build Your Kit": { pathname: "/corporate-gifting", hash: "#build-kit" },

  "Try Your Logo": { pathname: "/", hash: "#try-your-logo" },

  "About PrimeLinor": "/about",
  Contact: "/contact",
};

export const footerContact = {
  email: "hello@primelinor.example",
  phone: "+91 00000 00000",
  location: "India • PAN India delivery",
};

export const footerPolicies = [
  "Privacy Policy",
  "Terms of Use",
  "Shipping Policy",
  "Return & Replacement Policy",
];

export const socialPlaceholders = ["Instagram", "LinkedIn", "YouTube"];
