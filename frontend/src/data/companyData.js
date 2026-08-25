/**
 * COMPANY — data for /about and /contact.
 *
 * Everything here is restricted to facts already established elsewhere in
 * the project (design brief, mockData.js). No years-in-business, order
 * counts, client counts, certifications or infrastructure claims are
 * invented — see the About page brief's explicit list of things not to
 * fabricate.
 */

export const aboutHero = {
  eyebrow: "About PrimeLinor",
  title: "Custom Products, Made Simpler for Businesses",
  copy: "PrimeLinor helps businesses source, customize and order branded apparel, gifting and promotional products with flexible quantities and expert support.",
  primaryCtaLabel: "Explore Products",
  primaryCtaTo: "/products",
  secondaryCtaLabel: "Request a Quote",
};

export const whatWeCreate = [
  {
    id: "apparel",
    title: "Custom Apparel",
    description: "T-shirts, polos, hoodies, uniforms and caps, branded with your logo.",
    art: "polo",
    color: "#22304a",
    to: "/products",
  },
  {
    id: "corporate-gifting",
    title: "Corporate Gifting",
    description: "Curated kits and collections for teams, clients and festivals.",
    art: "giftbox",
    color: "#5c2733",
    to: "/corporate-gifting",
  },
  {
    id: "promotional-products",
    title: "Promotional Products",
    description: "Bottles, bags, pens and notebooks that keep your brand visible.",
    art: "pen",
    color: "#22304a",
    to: "/products",
  },
  {
    id: "employee-event-kits",
    title: "Employee & Event Kits",
    description: "Welcome kits, onboarding sets and attendee merchandise.",
    art: "kit",
    color: "#3c4a63",
    to: "/solutions/employee-gifting",
  },
];

export const valuePoints = [
  { title: "Flexible Quantities", description: "Product-level minimums instead of one fixed order size." },
  { title: "Product-Level MOQs", description: "Each product carries its own minimum, not a blanket rule." },
  { title: "Custom Branding", description: "Your logo, placed and previewed before you commit." },
  { title: "Logo Preview", description: "See your branding on the product before requesting a quote." },
  { title: "PAN India Supply", description: "Delivered wherever your teams or events are." },
  { title: "Dedicated Support", description: "A point of contact from enquiry through to delivery." },
];

export const howPrimeLinorWorks = [
  { title: "Explore products", description: "Browse apparel, gifting and promotional products." },
  { title: "Choose your requirement", description: "Pick products, colours and quantities." },
  { title: "Preview your branding", description: "See your logo before you commit." },
  { title: "Request a quote", description: "Share your requirement with our team." },
  { title: "Confirm and produce", description: "We confirm details and get to work." },
];

export const qualityStatements = [
  "Every product and branding detail is reviewed before production begins.",
  "Final artwork placement and commercial terms are confirmed with you directly, before anything is produced.",
];

/* ------------------------------------------------------------------ */
/* Contact page                                                        */
/* ------------------------------------------------------------------ */

export const contactHero = {
  eyebrow: "Contact",
  title: "Let's Talk About What You Need",
  copy: "Tell us what you're looking for and the PrimeLinor team can help you choose the right products, quantities and customization approach.",
};

/**
 * No real phone/email is configured yet — see the Contact page brief's
 * explicit instruction not to present the mockData.js footer placeholders
 * (hello@primelinor.example / +91 00000 00000) as real. Channels describe
 * what happens rather than showing an unverified value.
 */
export const contactChannels = [
  {
    id: "business-enquiry",
    title: "Business Enquiry",
    description: "Tell us what you need using the form — our team will follow up directly.",
  },
  {
    id: "whatsapp",
    title: "Chat with Our Team",
    description: "Continue the conversation on WhatsApp.",
    action: "whatsapp",
  },
  {
    id: "email",
    title: "Email Us",
    description: "Not yet connected in this prototype — use the enquiry form in the meantime.",
    pending: true,
  },
];

export const enquiryInterests = [
  { id: "apparel", label: "Custom Apparel" },
  { id: "gifting", label: "Corporate Gifting" },
  { id: "promotional", label: "Promotional Products" },
  { id: "kits", label: "Employee / Event Kits" },
  { id: "bulk", label: "Bulk Order" },
  { id: "other", label: "Something Else" },
];
