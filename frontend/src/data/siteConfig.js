/**
 * SITE CONFIG — navigation, mega menu, and footer. None of this is catalog
 * data and none of it will ever come from the Catalog API; it stays a
 * frontend-owned concern even after full backend integration.
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
  { id: "try-logo", label: "Try Your Logo", href: "/products" },
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

  "Try Your Logo": "/products",

  "About PrimeLinor": "/about",
  Contact: "/contact",
};

export const footerPolicies = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Shipping & Delivery", to: "/shipping-policy" },
  { label: "Return & Replacement", to: "/return-replacement-policy" },
];

/**
 * Real, official PrimeLinor social profiles. Only a network with a real
 * URL belongs here — Footer renders exactly this list, so an unconfigured
 * network (e.g. Facebook, LinkedIn) simply isn't shown rather than
 * linking nowhere.
 */
export const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/primelinor.bulk?igsi=a2ppbDMzMGx0cGsw",
    icon: "instagram",
    ariaLabel: "PrimeLinor on Instagram",
  },
  {
    name: "YouTube",
    url: "https://youtube.com/@primelinor-bulk?si=645NgDThlRiNOr0t",
    icon: "youtube",
    ariaLabel: "PrimeLinor on YouTube",
  },
];

/**
 * BUSINESS CONFIG — the single canonical source for PrimeLinor Bulk's real
 * business identity (confirmed owner input, Phase 6B closure). Every
 * customer-facing surface that needs a phone number, address, support
 * email or website URL reads from here rather than a local literal, so a
 * future detail change touches exactly one file. `whatsappNumber` here is
 * a display-purposes fallback matching the confirmed real number — the
 * WhatsApp CTA components still ask the backend's live
 * GET /config/public for the actual click-to-chat destination, since that
 * stays the authoritative, env-driven source of truth and can honestly
 * report "not configured" per deployment.
 */
export const businessConfig = {
  businessName: "PrimeLinor Bulk",
  supportEmail: "primelinor@gmail.com",
  phoneDisplay: "+91 9599122214",
  phoneE164: "+919599122214",
  whatsappNumber: "919599122214",
  addressLines: ["2nd Floor, C-107, C Block", "Sector 10, Noida, Uttar Pradesh 201301, India"],
  websiteUrl: "https://primelinorbulk.com",
  // Kept as its own literal (matching homeData.js's `trust.rating.url`)
  // rather than importing homeData here — that cross-module import pulled
  // the whole homeData module into the eagerly-loaded SiteLayout chain and
  // broke Seo.jsx's route-level code-splitting (main bundle +91KB,
  // measured and reverted during Phase 6B owner-input closure).
  googleMapsUrl:
    "https://www.google.com/maps/place/PrimeLinor/@28.5891563,77.3319841,17z/data=!3m1!4b1!4m6!3m5!1s0x390ce5dc2bce1395:0xeb94b99601375e18!8m2!3d28.5891563!4d77.3319841!16s%2Fg%2F11nbn1qdkb?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDgyNS4wIKXMDSoASAFQAw%3D%3D",
  instagramUrl: socialLinks.find((s) => s.name === "Instagram")?.url || null,
  youtubeUrl: socialLinks.find((s) => s.name === "YouTube")?.url || null,
};
