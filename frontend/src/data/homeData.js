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
/* Shop by category                                                    */
/* ------------------------------------------------------------------ */

/**
 * Homepage "Shop by category" curated merchandising list — deliberately
 * NOT a duplicate of category records (name/image/alt intentionally live
 * only in the backend now, fetched at render time and merged in by
 * slug — see CategoryGrid.jsx). This list only decides three frontend-only
 * things a Category row has no concept of: which categories to feature,
 * in what order, and the `art`/`color` vector fallback to show if a
 * category's real image hasn't been set (or hasn't loaded yet).
 *
 * `targetCategory` is a real backend Category slug — CategoryGrid hands it
 * to Product Listing via the same `location.state` pattern Solutions
 * pages already use. All 9 (including Visiting Cards) are now real
 * catalogue categories with real S3-backed images (see
 * backend/scripts/backfillCategoryImages.js) — nothing here should need a
 * `href` override to a non-catalogue destination anymore.
 */
export const categories = [
  { id: "tshirts", targetCategory: "tshirts", art: "tshirt", color: "#e3e6eb" },
  { id: "polo", targetCategory: "polo", art: "polo", color: "#22304a" },
  { id: "bags", targetCategory: "bags", art: "tote", color: "#e3ddd0" },
  { id: "bottles", targetCategory: "bottles", art: "bottle", color: "#dfe3e8" },
  { id: "notebooks", targetCategory: "notebooks", art: "notebook", color: "#2b2b33" },
  { id: "promotional", targetCategory: "promotional", art: "pen", color: "#22304a" },
  { id: "calendars", targetCategory: "calendars", art: "notebook", color: "#3c4a63" },
  { id: "gift-kits", targetCategory: "kits", art: "kit", color: "#dde1e8" },
  { id: "visiting-cards", targetCategory: "visiting-cards", art: "notebook", color: "#f2ede3" },
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
/* Trust — real, verified Google Reviews content for PrimeLinor         */
/* ------------------------------------------------------------------ */

export const trust = {
  rating: {
    source: "Google Reviews",
    value: 4.8,
    count: 28,
    url: "https://www.google.com/maps/place/PrimeLinor/@28.5891563,77.3319841,17z/data=!3m1!4b1!4m6!3m5!1s0x390ce5dc2bce1395:0xeb94b99601375e18!8m2!3d28.5891563!4d77.3319841!16s%2Fg%2F11nbn1qdkb?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDgyNS4wIKXMDSoASAFQAw%3D%3D",
    label: "Rated 4.8 on Google by 28 customers for print quality, fabric quality and service.",
  },
  /**
   * Real, verified Google reviews for PrimeLinor — no invented quotes.
   * `featuredOnHome` marks the 4 shown on the homepage; Naveen Kumar is
   * kept here for future reuse (e.g. a dedicated reviews page) without
   * being rendered on the homepage right now.
   */
  reviews: [
    {
      id: "sakshi-gupta",
      name: "Sakshi Gupta",
      rating: 5,
      timeAgo: "4 months ago",
      text: "We placed a bulk order and the quality exceeded our expectations. The printing is clean and the fabric is very comfortable. Great service!",
      featuredOnHome: true,
    },
    {
      id: "asif-raja",
      name: "Asif Raja",
      rating: 5,
      timeAgo: "4 months ago",
      text: "excellent print quality, fast service, good finishing",
      featuredOnHome: true,
    },
    {
      id: "rohan-tiwari",
      name: "Rohan Tiwari",
      rating: 5,
      timeAgo: "3 months ago",
      text: "Best quality production they have at reasonable rates. Must try them. They are best.",
      featuredOnHome: true,
    },
    {
      id: "pradyumn-aggarwal",
      name: "Pradyumn Aggarwal",
      rating: 5,
      timeAgo: "a month ago",
      text: "Good quality t shirt with Nice print",
      featuredOnHome: true,
    },
    {
      id: "naveen-kumar",
      name: "Naveen Kumar",
      rating: 5,
      timeAgo: "2 months ago",
      text: "Best quality best price thank you prime Linor",
      featuredOnHome: false,
    },
  ],
  /**
   * Reserved slots, not sample quotes — used by the Corporate Gifting page
   * (GiftingTrust) and Solution detail pages (SolutionProof), not by the
   * homepage trust section above. `quote` stays null until a verified
   * customer story is supplied for that specific context.
   */
  testimonials: [
    { id: "t1", context: "Employee welcome kits", quote: null, name: null, role: null, company: null },
    { id: "t2", context: "Event and conference merchandise", quote: null, name: null, role: null, company: null },
    { id: "t3", context: "Festival and client gifting", quote: null, name: null, role: null, company: null },
  ],
  /** Reserved order-photography slots — used by the Corporate Gifting page. */
  gallery: [
    { id: "g1", art: "tshirt", color: "#22304a", label: "Completed order photo placeholder", image: null },
    { id: "g2", art: "bottle", color: "#2b2b33", label: "Completed order photo placeholder", image: null },
    { id: "g3", art: "kit", color: "#e3ddd0", label: "Completed order photo placeholder", image: null },
    { id: "g4", art: "notebook", color: "#5c2733", label: "Completed order photo placeholder", image: null },
  ],
};
