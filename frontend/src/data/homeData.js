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
 * (e.g. "/images/hero/hero-apparel-main.jpg") or an imported asset.
 *
 * Recommended creative ratios (design banners to match the slot, so
 * object-fit: cover does not crop embedded campaign text):
 *
 *   hero_primary       ~2:1 landscape
 *   hero_secondary_*   ~1.7:1 landscape
 *   mobile primary     ~2:1
 *   mobile secondary   ~1.7:1
 *
 * `title` doubles as the visible headline once an image is set (see
 * CampaignBanner) — keep it short. `eyebrow`/`subtitle`/`ctaLabel` are
 * real HTML copy rendered over the image (never baked into the creative
 * itself). `renderMode: "image-only"` opts a banner OUT of all of that —
 * eyebrow/title/subtitle/CTA — for a creative that already has its own
 * marketing copy baked in (a finished design, not a photo); the image's
 * `altText` becomes the accessible description in that mode instead of
 * being decorative. Default (`renderMode` absent) renders the normal
 * eyebrow/headline/subtitle/CTA copy for hero_primary, and a minimal
 * single headline line for hero_secondary_* (see CampaignBanner).
 * `altText` is also what's used as the accessible label when a banner has
 * no image yet (placeholder state).
 * `objectPosition` is optional (CSS object-position) for later art direction.
 */
export const heroCampaigns = [
  {
    id: "hero-apparel",
    placement: "hero_primary",
    title: "Premium T-Shirts & Uniforms",
    eyebrow: "Custom Apparel",
    subtitle: "Custom apparel for teams, events and businesses.",
    ctaLabel: "Explore Apparel",
    altText: "PrimeLinor customized T-shirts, polo T-shirts and corporate uniforms",
    desktopImage: "/images/hero/hero-apparel-main.jpg",
    mobileImage: null,
    href: "/products",
    isActive: true,
    sortOrder: 1,
    objectPosition: "center",
  },
  {
    id: "hero-sports",
    placement: "hero_secondary_1",
    title: "Sports",
    renderMode: "image-only",
    altText: "Custom sports teamwear and jerseys",
    desktopImage: "/images/hero/hero-sports-teamwear.jpg",
    mobileImage: null,
    href: "/products",
    isActive: true,
    sortOrder: 2,
    objectPosition: "center",
  },
  {
    id: "hero-visiting-cards",
    placement: "hero_secondary_2",
    title: "Visiting Cards",
    renderMode: "image-only",
    altText: "Visiting cards and business print products",
    desktopImage: "/images/hero/hero-visiting-cards.jpg",
    mobileImage: null,
    href: "/products",
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

/**
 * Homepage "Shop by category" tiles. `targetCategory` is a real backend
 * Category slug (verified against the live catalogue, not the old mock
 * list — "Gift Kits" was pointing at a slug ("gift-kits") the real
 * catalogue has never used; the real slug is "kits") — CategoryCard hands
 * it to Product Listing via the same `location.state` pattern Solutions
 * pages already use, so clicking a tile actually filters to real products
 * instead of landing on an unfiltered or empty listing.
 *
 * `image`/`alt` are real-photo slots, data-driven rather than hardcoded
 * per card (CategoryCard just renders whatever's here). None of these 8
 * have dedicated category photography yet — `image: null` keeps the
 * existing vector/`art`+`color` fallback (intentional, not a broken
 * image) until real photos land. Expected path convention to match, so
 * dropping files in requires no code change:
 * `/images/categories/<id>.jpg` (e.g. `/images/categories/tshirts.jpg`).
 */
export const categories = [
  { id: "tshirts", name: "T-Shirts", targetCategory: "tshirts", art: "tshirt", color: "#e3e6eb", image: null, alt: "T-Shirts" },
  { id: "polo", name: "Polo T-Shirts", targetCategory: "polo", art: "polo", color: "#22304a", image: null, alt: "Polo T-Shirts" },
  { id: "bags", name: "Bags", targetCategory: "bags", art: "tote", color: "#e3ddd0", image: null, alt: "Bags" },
  { id: "bottles", name: "Bottles & Drinkware", targetCategory: "bottles", art: "bottle", color: "#dfe3e8", image: null, alt: "Bottles & Drinkware" },
  { id: "notebooks", name: "Notebooks & Diaries", targetCategory: "notebooks", art: "notebook", color: "#2b2b33", image: null, alt: "Notebooks & Diaries" },
  { id: "promotional", name: "Promotional Products", targetCategory: "promotional", art: "pen", color: "#22304a", image: null, alt: "Promotional Products" },
  { id: "corporate-gifts", name: "Corporate Gifts", targetCategory: "corporate-gifts", art: "giftbox", color: "#3c4a63", image: null, alt: "Corporate Gifts" },
  { id: "gift-kits", name: "Gift Kits", targetCategory: "kits", art: "kit", color: "#dde1e8", image: null, alt: "Gift Kits" },
  // Not a real category/product yet (verified: no Category or Product row
  // exists for it) — the tile still appears (brief §2D) but routes to
  // Contact rather than a Product Listing filter that could never return
  // anything, which would misleadingly look like "we searched and found
  // nothing" rather than "we don't offer this yet, ask us". A real photo
  // already exists at /images/hero/hero-visiting-cards.jpg (separate hero
  // work) but it's composed as a wide banner with its own baked-in
  // headline text — cropping it into this card's 4:2.9 tile truncates
  // that text mid-word, which reads as more broken than the vector
  // fallback it would replace. Needs its own tile-shaped crop (no text
  // baked in) at the same /images/categories/<id>.jpg convention as the
  // other 8 before wiring a real photo here.
  {
    id: "visiting-cards",
    name: "Visiting Cards",
    targetCategory: null,
    href: "/contact",
    art: "notebook",
    color: "#f2ede3",
    image: null,
    alt: "Visiting Cards",
  },
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
