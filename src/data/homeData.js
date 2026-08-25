/**
 * HOMEPAGE DATA — presentational content specific to the (frozen) Homepage.
 * Split out of mockData.js so it's clearly distinct from catalogData.js
 * (real product/catalog domain data) and siteConfig.js (nav/footer).
 */

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
