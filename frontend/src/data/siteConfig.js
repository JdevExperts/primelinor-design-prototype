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
