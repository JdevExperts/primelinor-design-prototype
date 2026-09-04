/**
 * CORPORATE GIFTING — curation config ONLY.
 *
 * Corporate Gifting is a curated merchandising / discovery page over the
 * ONE Product catalogue — it is NOT a second catalogue. This file therefore
 * holds only:
 *
 *   - which canonical products/categories to feature (by slug)
 *   - grouping, section copy, display order, gifting context
 *   - non-catalogue presentational content (benefits strip, packaging blurb)
 *
 * It must NOT hold a product's name / image / price / MOQ / product code —
 * those are resolved at runtime from the public Product & Category APIs via
 * utils/giftingCatalogue.js, so every product shown here is the same record,
 * image and price as under the Products tab.
 */

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

/**
 * `image` is resolved from a real Category (Gift Kits / Promotional
 * Products) at runtime. `desktopImage` / `mobileImage` stay as an explicit
 * manual override slot (a curated campaign photo) — null means "use the
 * resolved category image, else the composed placeholder".
 */
export const giftingHero = {
  eyebrow: "Corporate Gifting",
  title: "Corporate Gifting Made Personal",
  description:
    "Create branded employee kits, festival gifts, client gifts and event merchandise with flexible quantities and expert support.",
  imageSource: { kind: "category", slug: "promotional" },
  desktopImage: null,
  mobileImage: null,
  altText: "PrimeLinor corporate gifting range",
};

/* ------------------------------------------------------------------ */
/* Gifting use cases — "what are you gifting for?"                     */
/* ------------------------------------------------------------------ */

/**
 * Discovery entry points, not products. Each `imageSource` points at a real
 * Category or a real Product's primary image; `art`/`color` stay only as
 * the placeholder shown until (or if) that image resolves.
 */
export const giftingUseCases = [
  {
    id: "welcome-kits",
    title: "Employee Welcome Kits",
    description: "Make every new joiner feel part of the team.",
    art: "kit",
    color: "#3c4a63",
    imageSource: { kind: "category", slug: "kits" },
    anchor: "welcome-kit-feature",
  },
  {
    id: "festival-gifting",
    title: "Festival Gifting",
    description: "Curated branded gifts for company-wide celebrations.",
    art: "giftbox",
    color: "#5c2733",
    imageSource: { kind: "product", slug: "festival-gift-box" },
    anchor: "gift-collections",
  },
  {
    id: "client-partner-gifts",
    title: "Client & Partner Gifts",
    description: "Premium gifts that keep your brand remembered.",
    art: "notebook",
    color: "#2b2b33",
    imageSource: { kind: "product", slug: "executive-gift-set" },
    anchor: "gift-collections",
  },
  {
    id: "events-conferences",
    title: "Events & Conferences",
    description: "Useful branded merchandise for attendees and teams.",
    art: "tote",
    color: "#22304a",
    imageSource: { kind: "product", slug: "conference-kit" },
    anchor: "gift-collections",
  },
];

/* ------------------------------------------------------------------ */
/* Gift collections — curated real gift-kit / promotional products     */
/* ------------------------------------------------------------------ */

/**
 * Every entry is a canonical Product (a real gift-kit SKU with its own PDP,
 * price and MOQ). "View Details" routes to /products/{slug}; "Request Kit
 * Quote" opens the quote modal with the real product. No inline kit
 * definitions — customers who want a bespoke mix use Build Your Own Kit.
 */
export const giftCollections = [
  { slug: "welcome-kit", context: "Onboarding gifting" },
  { slug: "executive-gift-set", context: "Leadership & client gifting" },
  { slug: "festival-gift-box", context: "Company-wide festival gifting" },
  { slug: "conference-kit", context: "Events & conferences" },
  { slug: "event-essentials-kit", context: "Attendee merchandise" },
  { slug: "promotional-merchandise-kit", context: "Broad promotional gifting" },
];

/* ------------------------------------------------------------------ */
/* Employee Welcome Kit — signature feature                            */
/* ------------------------------------------------------------------ */

/**
 * `items` name the real products the welcome kit is built from (resolved to
 * their catalogue image at runtime). "Welcome Card" has no catalogue SKU —
 * it stays a supporting marketing visual (`productSlug: null`).
 */
export const welcomeKitFeature = {
  eyebrow: "Employee welcome kits",
  title: "Welcome New Employees With Something Useful",
  description:
    "A considered kit on day one says more than an email ever will. Choose the pieces, add your logo, and we handle the rest.",
  items: [
    { id: "tshirt-polo", label: "T-Shirt / Polo", productSlug: "cotton-round-neck", art: "tshirt", color: "#22304a" },
    { id: "bottle", label: "Bottle", productSlug: "corporate-bottle", art: "bottle", color: "#dfe3e8" },
    { id: "notebook", label: "Notebook", productSlug: "a5-notebook-diary", art: "notebook", color: "#2b2b33" },
    { id: "pen", label: "Pen", productSlug: "metal-pen", art: "pen", color: "#22304a" },
    { id: "backpack-tote", label: "Backpack / Tote", productSlug: "laptop-backpack", art: "backpack", color: "#3c4a63" },
    { id: "welcome-card", label: "Welcome Card", productSlug: null, art: "notebook", color: "#5c2733" },
  ],
  /** Links "Explore Welcome Kits" to the real welcome-kit catalogue product. */
  productSlug: "welcome-kit",
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
 * `art`/`color` reuse the ProductVisual placeholder system; this is a
 * requirements-capture step (the team confirms exact SKUs), so it
 * deliberately does not resolve to catalogue products.
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
/* Popular gifting products — canonical catalogue products by slug      */
/* ------------------------------------------------------------------ */

export const popularGiftingProductSlugs = [
  "corporate-bottle",
  "a5-notebook-diary",
  "metal-pen",
  "laptop-backpack",
  "ceramic-mug",
  "canvas-tote",
  "executive-notebook",
  "vacuum-insulated-bottle",
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
