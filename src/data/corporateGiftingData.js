/**
 * CORPORATE GIFTING — page-specific mock data.
 *
 * Kept separate from mockData.js (which is already large) because this
 * content only serves /corporate-gifting. Anything that is really a
 * catalogue product (real MOQ/price, a real PDP) stays in mockData.js and is
 * only referenced here by id — see `giftCollections` below.
 */

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

/**
 * Admin-ready like the homepage campaign banners: swap `desktopImage` /
 * `mobileImage` for a public path later. Null renders the composed
 * placeholder in GiftingHero instead of a photo.
 */
export const giftingHero = {
  eyebrow: "Corporate Gifting",
  title: "Corporate Gifting Made Personal",
  description:
    "Create branded employee kits, festival gifts, client gifts and event merchandise with flexible quantities and expert support.",
  desktopImage: null,
  mobileImage: null,
  altText:
    "Curated PrimeLinor corporate gifting composition — bottle, notebook and gift box, photography placeholder",
};

/* ------------------------------------------------------------------ */
/* Gifting use cases — "what kind of project are you working on?"      */
/* ------------------------------------------------------------------ */

export const giftingUseCases = [
  {
    id: "welcome-kits",
    title: "Employee Welcome Kits",
    description: "Make every new joiner feel part of the team.",
    art: "kit",
    color: "#3c4a63",
    image: null,
    anchor: "welcome-kit-feature",
  },
  {
    id: "festival-gifting",
    title: "Festival Gifting",
    description: "Curated branded gifts for company-wide celebrations.",
    art: "giftbox",
    color: "#5c2733",
    image: null,
    anchor: "gift-collections",
  },
  {
    id: "client-partner-gifts",
    title: "Client & Partner Gifts",
    description: "Premium gifts that keep your brand remembered.",
    art: "notebook",
    color: "#2b2b33",
    image: null,
    anchor: "gift-collections",
  },
  {
    id: "events-conferences",
    title: "Events & Conferences",
    description: "Useful branded merchandise for attendees and teams.",
    art: "tote",
    color: "#22304a",
    image: null,
    anchor: "gift-collections",
  },
];

/* ------------------------------------------------------------------ */
/* Gift collections                                                    */
/* ------------------------------------------------------------------ */

/**
 * Two kinds of card, same shape once resolved by getGiftCollections():
 *
 *  - `catalogue`  references a real product in mockData.js by id. It has a
 *    real PDP, so its card routes "View Details" to /products/:id.
 *  - `concept`    a curated bundle that is not (yet) its own catalogue SKU.
 *    No PDP exists, so its card opens the quote modal directly instead
 *    (see §41/§43 — no kit detail page in V1).
 *
 * Concept prices are representative kit prices, set directly here — the
 * same way any fixed/tiered catalogue product is priced. This is not the
 * "fake bundle pricing engine" the brief warns against (that refers to the
 * Kit Builder inventing a total from arbitrary selected items); a curated,
 * pre-defined collection pricing itself is exactly how the rest of the
 * catalogue already works.
 */
export const giftCollections = [
  { kind: "catalogue", productId: "welcome-kit" },
  { kind: "catalogue", productId: "executive-gift-set" },
  { kind: "catalogue", productId: "festival-gift-box" },
  { kind: "catalogue", productId: "conference-kit" },
  {
    kind: "concept",
    id: "client-appreciation-set",
    name: "Client Appreciation Set",
    contentsSummary: "Notebook • Bottle • Thank-You Card",
    art: "giftbox",
    color: "#5c2733",
    priceType: "fixed",
    price: 1299,
    priceNote: null,
    moq: 25,
    unit: "set",
    tiers: null,
  },
  {
    kind: "concept",
    id: "work-from-home-kit",
    name: "Work-from-Home Kit",
    contentsSummary: "Mug • Notebook • Desk Organizer",
    art: "kit",
    color: "#22304a",
    priceType: "fixed",
    price: 999,
    priceNote: null,
    moq: 20,
    unit: "kit",
    tiers: null,
  },
  {
    kind: "concept",
    id: "travel-gift-set",
    name: "Travel Gift Set",
    contentsSummary: "Bottle • Backpack • Pouch",
    art: "backpack",
    color: "#3c4a63",
    priceType: "tiered",
    price: 1499,
    priceNote: "for 20–99 kits",
    moq: 20,
    unit: "kit",
    tiers: [
      { from: 20, to: 99, price: 1499 },
      { from: 100, to: null, price: 1349 },
    ],
  },
  {
    kind: "concept",
    id: "eco-friendly-gift-set",
    name: "Eco-Friendly Gift Set",
    contentsSummary: "Bamboo Pen • Jute Bag • Notebook",
    art: "tote",
    color: "#b9a888",
    priceType: "fixed",
    price: 799,
    priceNote: null,
    moq: 25,
    unit: "set",
    tiers: null,
  },
];

/* ------------------------------------------------------------------ */
/* Employee Welcome Kit — signature feature                            */
/* ------------------------------------------------------------------ */

export const welcomeKitFeature = {
  eyebrow: "Employee welcome kits",
  title: "Welcome New Employees With Something Useful",
  description:
    "A considered kit on day one says more than an email ever will. Choose the pieces, add your logo, and we handle the rest.",
  items: [
    { id: "tshirt-polo", label: "T-Shirt / Polo", art: "tshirt", color: "#22304a" },
    { id: "bottle", label: "Bottle", art: "bottle", color: "#dfe3e8" },
    { id: "notebook", label: "Notebook", art: "notebook", color: "#2b2b33" },
    { id: "pen", label: "Pen", art: "pen", color: "#22304a" },
    { id: "backpack-tote", label: "Backpack / Tote", art: "backpack", color: "#3c4a63" },
    { id: "welcome-card", label: "Welcome Card", art: "notebook", color: "#5c2733" },
  ],
  /** Links "Explore Welcome Kits" to the real welcome-kit catalogue product. */
  productId: "welcome-kit",
};

/* ------------------------------------------------------------------ */
/* Build Your Kit                                                      */
/* ------------------------------------------------------------------ */

export const kitAudiences = [
  { id: "new-employees", label: "New Employees" },
  { id: "existing-team", label: "Existing Team" },
  { id: "clients-partners", label: "Clients / Partners" },
  { id: "event-attendees", label: "Event Attendees" },
  { id: "students", label: "Students" },
  { id: "other", label: "Other" },
];

/**
 * Product TYPES the customer can shortlist for a kit — not SKUs/colours.
 * `art`/`color` reuse the ProductVisual placeholder system; a couple of
 * entries reuse an illustration that isn't a perfect semantic match
 * (there's no dedicated "tech accessory" art) — acceptable for a
 * placeholder icon, swapped for real photography later.
 */
export const giftKitItems = [
  { id: "tshirt-polo", label: "T-Shirt / Polo", art: "tshirt", color: "#22304a" },
  { id: "bottle", label: "Bottle", art: "bottle", color: "#dfe3e8" },
  { id: "notebook", label: "Notebook", art: "notebook", color: "#2b2b33" },
  { id: "pen", label: "Pen", art: "pen", color: "#22304a" },
  { id: "backpack-tote", label: "Backpack / Tote", art: "backpack", color: "#3c4a63" },
  { id: "mug", label: "Mug", art: "mug", color: "#e8eaee" },
  { id: "tech-accessory", label: "Tech Accessory", art: "kit", color: "#5c2733" },
  { id: "gift-box", label: "Gift Box / Packaging", art: "giftbox", color: "#e3ddd0" },
];

export const kitBudgetOptions = [
  { id: "under-500", label: "Under ₹500" },
  { id: "500-999", label: "₹500–₹999" },
  { id: "1000-1499", label: "₹1,000–₹1,499" },
  { id: "1500-2499", label: "₹1,500–₹2,499" },
  { id: "2500-plus", label: "₹2,500+" },
  { id: "not-sure", label: "Flexible / Not sure" },
];

export const kitQuantityChips = [50, 100, 250, 500];
export const kitDefaultQuantity = 50;

/* ------------------------------------------------------------------ */
/* Popular gifting products — real catalogue products, reused as-is    */
/* ------------------------------------------------------------------ */

export const popularGiftingProductIds = [
  "corporate-bottle",
  "premium-notebook",
  "metal-pen",
  "laptop-backpack",
  "ceramic-mug",
  "canvas-tote",
  "executive-diary",
  "vacuum-flask",
];

/* ------------------------------------------------------------------ */
/* Gifting for every occasion                                          */
/* ------------------------------------------------------------------ */

export const giftOccasions = [
  { id: "onboarding", title: "New Employee Onboarding", description: "A welcome kit that lands on day one.", art: "kit", color: "#3c4a63" },
  { id: "festival", title: "Diwali / Festival Gifting", description: "Company-wide gifting without the last-minute scramble.", art: "giftbox", color: "#5c2733" },
  { id: "events", title: "Annual Events", description: "Merchandise your team actually wants to wear.", art: "tote", color: "#22304a" },
  { id: "client-appreciation", title: "Client Appreciation", description: "A considered gift that keeps your brand top of mind.", art: "notebook", color: "#2b2b33" },
  { id: "recognition", title: "Employee Recognition", description: "Mark milestones with something worth keeping.", art: "mug", color: "#e8eaee" },
  { id: "milestones", title: "Company Milestones", description: "Anniversary and launch gifting at team scale.", art: "bottle", color: "#dfe3e8" },
];

/* ------------------------------------------------------------------ */
/* Branding + packaging                                                */
/* ------------------------------------------------------------------ */

export const brandingExamples = [
  { id: "bottle", label: "Bottle", art: "bottle", color: "#dfe3e8" },
  { id: "notebook", label: "Notebook", art: "notebook", color: "#2b2b33" },
  { id: "bag", label: "Bag", art: "tote", color: "#e3ddd0" },
  { id: "gift-box", label: "Gift Box", art: "giftbox", color: "#3c4a63" },
];

export const packagingOptions = [
  { id: "standard-box", title: "Standard Gift Box", description: "Clean, sturdy presentation for everyday gifting.", art: "giftbox", color: "#e3ddd0" },
  { id: "premium-rigid-box", title: "Premium Rigid Box", description: "A heavier, magnetic-close box for leadership and client gifts.", art: "kit", color: "#3c4a63" },
  { id: "eco-packaging", title: "Eco Packaging", description: "Recyclable and kraft-finish options.", art: "tote", color: "#b9a888" },
  { id: "custom-sleeve", title: "Custom Sleeve / Card", description: "A branded sleeve or card added to any packaging.", art: "notebook", color: "#2b2b33" },
];

/* ------------------------------------------------------------------ */
/* Why PrimeLinor for corporate gifting                                */
/* ------------------------------------------------------------------ */

export const giftingBenefits = [
  { id: "flexible-quantities", title: "Flexible Quantities", description: "From a 25-piece welcome kit to a company-wide rollout.", icon: "sliders" },
  { id: "custom-branding", title: "Custom Branding", description: "Your logo across apparel, drinkware, stationery and packaging.", icon: "upload" },
  { id: "curated-kits", title: "Curated Kits", description: "Ready combinations, or build one around your budget.", icon: "package" },
  { id: "pan-india-supply", title: "PAN India Supply", description: "Delivered wherever your team or event is.", icon: "pin" },
  { id: "dedicated-support", title: "Dedicated Support", description: "A gifting expert to help you choose and confirm.", icon: "headset" },
];
