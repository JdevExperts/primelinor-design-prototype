/**
 * SOLUTIONS — page-specific mock data.
 *
 * One reusable template (SolutionDetail) renders whichever solution this
 * data describes. Content, imagery, recommended products, benefits,
 * process steps, feature blocks and CTA copy are all data-driven so a real
 * backend/CMS can eventually replace this file without touching page
 * structure — see individual field comments below.
 *
 * `heroImage` / `mobileHeroImage` follow the same admin-ready convention as
 * the homepage campaign banners and the Corporate Gifting hero: null today
 * renders a composed ProductVisual placeholder; a real photo later is a
 * data change only.
 */

export const solutions = [
  {
    slug: "corporate-teams",
    label: "Corporate Teams",
    eyebrow: "CORPORATE TEAMS",
    art: "polo",
    color: "#22304a",
    hubDescription:
      "Branded apparel and everyday work essentials for teams of every size.",
    categoryHints: ["T-Shirts", "Polos", "Bottles", "Bags"],

    heroTitle: "Branded Essentials Your Team Will Actually Use",
    heroCopy:
      "Create coordinated apparel, drinkware and work essentials with flexible quantities and consistent branding.",
    heroImage: null,
    mobileHeroImage: null,
    heroAlt: "Coordinated corporate team apparel and drinkware, photography placeholder",

    challengeTitle: "Outfitting a Team Shouldn't Be Complicated",
    challengeCopy:
      "Different departments need different products and different quantities, with the same brand look throughout. We keep it consistent without the back-and-forth.",
    challengePoints: [
      "Mixed product requirements across teams",
      "Different quantities per department",
      "One consistent brand look",
      "Full size ranges",
      "Coordinated delivery",
    ],
    useCases: [
      "Everyday team apparel",
      "Employee onboarding",
      "Offsites",
      "Client-facing staff",
    ],

    recommendedProductIds: [
      "premium-polo",
      "cotton-round-neck",
      "corporate-bottle",
      "laptop-backpack",
      "executive-diary",
    ],
    recommendedCategories: [
      { id: "tshirts", label: "T-Shirts" },
      { id: "polo", label: "Polo T-Shirts" },
      { id: "bottles", label: "Bottles & Drinkware" },
      { id: "bags", label: "Bags" },
    ],

    benefits: [
      { title: "Flexible Quantities", description: "Order what each team actually needs, not a fixed batch size." },
      { title: "Consistent Branding", description: "The same logo placement and quality across every product type." },
      { title: "Multiple Product Types", description: "Apparel, drinkware and bags from one order." },
      { title: "PAN India Supply", description: "Delivered wherever your teams are based." },
      { title: "Dedicated Support", description: "One point of contact from enquiry to delivery." },
    ],

    processSteps: [
      { title: "Tell us what you need", description: "Share the teams, products and rough quantities." },
      { title: "Choose products", description: "Pick from apparel, drinkware and work essentials." },
      { title: "Preview your branding", description: "See your logo before you commit." },
      { title: "Confirm quantity", description: "Adjust per department if needed." },
      { title: "Receive quotation", description: "Our team confirms pricing and dispatch." },
    ],

    featureSections: [
      {
        id: "uniform-programs",
        title: "Uniform Programs",
        description:
          "Standardize apparel across departments, roles or locations — sized, branded and reordered the same way each time.",
        art: "tshirt",
        color: "#3c4a63",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
      {
        id: "new-joiner-kits",
        title: "New Joiner Kits",
        description: "Give every new hire the same considered welcome, on day one.",
        art: "kit",
        color: "#22304a",
        ctaLabel: "Explore Employee Gifting",
        ctaTo: "/solutions/employee-gifting",
      },
    ],

    proofTestimonialId: null,

    primaryCtaLabel: "Request a Quote",
    secondaryCtaLabel: "Explore Products",
    secondaryCtaTo: "/products",

    finalCta: {
      title: "Ready to Outfit Your Team?",
      subtitle: null,
      ctas: [
        { type: "quote", label: "Request a Quote" },
        { type: "link", label: "Browse Products", to: "/products" },
      ],
    },
  },

  {
    slug: "startups",
    label: "Startups",
    eyebrow: "STARTUPS",
    art: "tshirt",
    color: "#e3e6eb",
    hubDescription: "Launch merchandise and team apparel at founder-friendly quantities.",
    categoryHints: ["T-Shirts", "Hoodies", "Totes", "Notebooks"],

    heroTitle: "Small Quantities Without Looking Small",
    heroCopy:
      "Start with 5–25 pieces, preview your logo in minutes, and scale up as your team grows.",
    heroImage: null,
    mobileHeroImage: null,
    heroAlt: "Small-batch startup team apparel, photography placeholder",

    challengeTitle: "You Don't Need a Warehouse of Merch Yet",
    challengeCopy:
      "Early teams need branded products without committing to a large batch. We keep minimums low so you can start small and reorder as you grow.",
    challengePoints: [
      "Low minimum quantities",
      "Small-batch friendly production",
      "Quick logo preview",
      "Room to scale later",
    ],
    useCases: [
      "Founding team apparel",
      "Launch merchandise",
      "Early hires",
      "Investor / press mailers",
    ],

    recommendedProductIds: [
      "slim-fit-tee",
      "pullover-hoodie",
      "canvas-tote",
      "premium-notebook",
      "metal-pen",
    ],
    recommendedCategories: [
      { id: "tshirts", label: "T-Shirts" },
      { id: "hoodies", label: "Hoodies" },
      { id: "bags", label: "Bags" },
      { id: "notebooks", label: "Notebooks & Diaries" },
    ],

    benefits: [
      { title: "Low Minimums", description: "5–25 pieces on many products, not hundreds." },
      { title: "Small-Batch Friendly", description: "Production sized for early teams." },
      { title: "Easy Logo Preview", description: "See your branding before you order." },
      { title: "Scale When Ready", description: "Move to standard volume pricing as your headcount grows." },
    ],

    processSteps: [
      { title: "Tell us what you need", description: "Share your team size and what you're launching." },
      { title: "Choose products", description: "Pick from apparel, bags and desk essentials." },
      { title: "Preview your branding", description: "See your logo before you order." },
      { title: "Confirm quantity", description: "Even a small batch works." },
      { title: "Receive quotation", description: "Clear pricing for your first order." },
    ],

    featureSections: [
      {
        id: "launch-merchandise",
        title: "Launch Merchandise",
        description: "Branded pieces ready for your launch day, demo day or first event.",
        art: "tote",
        color: "#2b2b33",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
      {
        id: "small-batch-apparel",
        title: "Small-Batch Team Apparel",
        description: "Outfit a five-person team the same way you'll outfit a fifty-person one.",
        art: "tshirt",
        color: "#22304a",
        ctaLabel: "Try Your Logo",
        ctaTo: "/customize/cotton-round-neck",
      },
    ],

    proofTestimonialId: null,

    primaryCtaLabel: "Request a Quote",
    secondaryCtaLabel: "Explore Products",
    secondaryCtaTo: "/products",

    finalCta: {
      title: "Ready to Launch Your Merch?",
      subtitle: null,
      ctas: [
        { type: "quote", label: "Request a Quote" },
        { type: "link", label: "Browse Products", to: "/products" },
      ],
    },
  },

  {
    slug: "events-conferences",
    label: "Events & Conferences",
    eyebrow: "EVENTS & CONFERENCES",
    art: "cap",
    color: "#2b2b33",
    hubDescription: "Event merchandise and attendee kits, planned around your date.",
    categoryHints: ["T-Shirts", "Caps", "Bags", "Bottles"],

    heroTitle: "Merchandise Ready Before Your Event Date",
    heroCopy:
      "Event T-shirts, caps, bags and attendee kits — branded consistently and planned around your date.",
    heroImage: null,
    mobileHeroImage: null,
    heroAlt: "Event and conference merchandise composition, photography placeholder",

    challengeTitle: "Events Run on Fixed Dates",
    challengeCopy:
      "Merchandise for an event has to be ready on time, consistent across every attendee, and confirmed well before the day. We plan production around your date, not the other way round.",
    challengePoints: [
      "A fixed event date",
      "Consistent merchandise across attendees",
      "Multiple product types in one order",
      "Dispatch that lines up with your schedule",
    ],
    useCases: [
      "Attendee kits",
      "Staff and volunteer wear",
      "Speaker gifts",
      "Booth giveaways",
    ],

    recommendedProductIds: [
      "dry-fit-tee",
      "event-cap",
      "sipper-bottle",
      "canvas-tote",
      "lanyard",
    ],
    recommendedCategories: [
      { id: "tshirts", label: "T-Shirts" },
      { id: "caps", label: "Caps" },
      { id: "bags", label: "Bags" },
      { id: "bottles", label: "Bottles & Drinkware" },
    ],

    benefits: [
      { title: "Planned Around Your Date", description: "We work backwards from your event date, not a generic lead time." },
      { title: "Consistent Merchandise", description: "The same branding across every attendee kit." },
      { title: "Multiple Product Types", description: "Apparel, bags, drinkware and lanyards in one order." },
      { title: "PAN India Supply", description: "Delivered to your venue or team, wherever it is." },
    ],

    processSteps: [
      { title: "Share your event date", description: "Tell us when and how many attendees." },
      { title: "Choose products", description: "Apparel, bags, drinkware or a full kit." },
      { title: "Preview your branding", description: "Confirm the look before production." },
      { title: "Confirm quantity", description: "Adjust for final headcount." },
      { title: "Receive quotation", description: "Pricing and a dispatch timeline that fits your date." },
    ],

    featureSections: [
      {
        id: "deadline-friendly-kits",
        title: "Deadline-Friendly Event Kits",
        description:
          "A curated kit — apparel, bag and drinkware — planned against your event date, not an open-ended timeline.",
        art: "kit",
        color: "#22304a",
        ctaLabel: "Explore Conference Kits",
        ctaTo: "/products/conference-kit",
      },
      {
        id: "attendee-merchandise",
        title: "Attendee Merchandise",
        description: "Give every attendee something they'll actually use after the event ends.",
        art: "tote",
        color: "#3c4a63",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
    ],

    /** Matches trust.testimonials[id] in mockData.js — reused, not duplicated. */
    proofTestimonialId: "t2",

    primaryCtaLabel: "Request a Quote",
    secondaryCtaLabel: "Explore Products",
    secondaryCtaTo: "/products",

    finalCta: {
      title: "Planning an Event?",
      subtitle: "Tell us your date and quantity — we'll plan production around it.",
      ctas: [
        { type: "quote", label: "Request a Quote" },
        { type: "link", label: "Browse Products", to: "/products" },
      ],
    },
  },

  {
    slug: "schools-colleges",
    label: "Schools & Colleges",
    eyebrow: "SCHOOLS & COLLEGES",
    art: "hoodie",
    color: "#3c4a63",
    hubDescription: "Uniforms, department apparel and fest merchandise for campuses of any size.",
    categoryHints: ["Polos", "T-Shirts", "Hoodies", "Bags"],

    heroTitle: "Uniforms and Campus Merchandise, Handled at Scale",
    heroCopy:
      "Uniforms, house and department apparel, and fest merchandise — ordered consistently across a full campus.",
    heroImage: null,
    mobileHeroImage: null,
    heroAlt: "School and college uniform and merchandise composition, photography placeholder",

    challengeTitle: "Campus Orders Are Bigger Than They Look",
    challengeCopy:
      "A single order can span multiple houses, departments or batches, each with its own sizing. We keep it organised so nothing gets mismatched.",
    challengePoints: [
      "Multiple houses or departments",
      "Full size ranges for students",
      "Consistent colours across batches",
      "Bulk campus-wide delivery",
    ],
    useCases: [
      "Uniforms",
      "House / department apparel",
      "Fest and event merchandise",
      "Orientation kits",
    ],

    recommendedProductIds: [
      "cotton-polo",
      "cotton-round-neck",
      "pullover-hoodie",
      "corporate-bottle",
      "laptop-backpack",
    ],
    recommendedCategories: [
      { id: "polo", label: "Polo T-Shirts" },
      { id: "tshirts", label: "T-Shirts" },
      { id: "hoodies", label: "Hoodies" },
      { id: "bags", label: "Bags" },
    ],

    benefits: [
      { title: "Full Size Ranges", description: "Sized for a whole student body, not a sample set." },
      { title: "Consistent Branding", description: "The same look across houses, departments or batches." },
      { title: "Flexible Quantities", description: "From one department to the full campus." },
      { title: "PAN India Supply", description: "Delivered to the campus directly." },
    ],

    processSteps: [
      { title: "Tell us what you need", description: "Share departments, houses or batches involved." },
      { title: "Choose products", description: "Uniforms, apparel, bags or drinkware." },
      { title: "Preview your branding", description: "Confirm colours and logo placement." },
      { title: "Confirm quantity", description: "By department, batch or size range." },
      { title: "Receive quotation", description: "One consolidated quote for the full order." },
    ],

    featureSections: [
      {
        id: "uniforms",
        title: "Uniforms",
        description: "Consistent, durable uniforms sized for an entire student body.",
        art: "polo",
        color: "#22304a",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
      {
        id: "fest-merchandise",
        title: "Fest & Department Merchandise",
        description: "Apparel and bags that give each department or fest its own identity.",
        art: "tote",
        color: "#5c2733",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
    ],

    proofTestimonialId: null,

    primaryCtaLabel: "Request a Quote",
    secondaryCtaLabel: "Explore Products",
    secondaryCtaTo: "/products",

    finalCta: {
      title: "Planning a Campus Order?",
      subtitle: null,
      ctas: [
        { type: "quote", label: "Request a Quote" },
        { type: "link", label: "Browse Products", to: "/products" },
      ],
    },
  },

  {
    slug: "marketing-campaigns",
    label: "Marketing Campaigns",
    eyebrow: "MARKETING CAMPAIGNS",
    art: "pen",
    color: "#22304a",
    hubDescription: "Promotional products and giveaways that keep your brand in hand.",
    categoryHints: ["Totes", "Bottles", "Pens", "Notebooks"],

    heroTitle: "Branded Products That Stay Visible",
    heroCopy:
      "Promotional products, campaign giveaways and event merchandise that keep your brand in hand after the campaign ends.",
    heroImage: null,
    mobileHeroImage: null,
    heroAlt: "Marketing campaign promotional products composition, photography placeholder",

    challengeTitle: "A Giveaway Only Works If It's Kept",
    challengeCopy:
      "Campaign merchandise needs to be useful enough to keep and consistent enough to be recognisable. We help you pick products people actually use again.",
    challengePoints: [
      "Products people keep and use",
      "Consistent branding across items",
      "Quantities that match campaign reach",
      "Timelines that match campaign dates",
    ],
    useCases: [
      "Giveaways",
      "Product launches",
      "Campaign kits",
      "Booth and event promotions",
    ],

    recommendedProductIds: [
      "canvas-tote",
      "sipper-bottle",
      "metal-pen",
      "baseball-cap",
      "premium-notebook",
      "promotional-badge",
    ],
    recommendedCategories: [
      { id: "bags", label: "Bags" },
      { id: "bottles", label: "Bottles & Drinkware" },
      { id: "pens", label: "Pens" },
      { id: "promotional", label: "Promotional Products" },
    ],

    benefits: [
      { title: "Products People Keep", description: "Useful items, not disposable giveaways." },
      { title: "Consistent Branding", description: "The same look across every touchpoint." },
      { title: "Flexible Quantities", description: "From a single launch event to a full campaign rollout." },
      { title: "PAN India Supply", description: "Delivered wherever your campaign runs." },
    ],

    processSteps: [
      { title: "Tell us about your campaign", description: "Share the occasion and rough reach." },
      { title: "Choose products", description: "Pick items people will actually keep." },
      { title: "Preview your branding", description: "Confirm the look before production." },
      { title: "Confirm quantity", description: "Match it to your campaign reach." },
      { title: "Receive quotation", description: "Pricing that fits your campaign timeline." },
    ],

    featureSections: [
      {
        id: "campaign-giveaways",
        title: "Campaign Giveaways",
        description: "Practical, branded items built for a single campaign moment.",
        art: "giftbox",
        color: "#3c4a63",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
      {
        id: "event-promotions",
        title: "Event Promotions",
        description: "Merchandise for launches, booths and on-ground activations.",
        art: "cap",
        color: "#22304a",
        ctaLabel: "Explore Events Solution",
        ctaTo: "/solutions/events-conferences",
      },
    ],

    proofTestimonialId: null,

    primaryCtaLabel: "Request a Quote",
    secondaryCtaLabel: "Explore Products",
    secondaryCtaTo: "/products",

    finalCta: {
      title: "Planning a Campaign?",
      subtitle: null,
      ctas: [
        { type: "quote", label: "Request a Quote" },
        { type: "link", label: "Browse Products", to: "/products" },
      ],
    },
  },

  {
    slug: "employee-gifting",
    label: "Employee Gifting",
    eyebrow: "EMPLOYEE GIFTING",
    art: "kit",
    color: "#e3ddd0",
    hubDescription: "Welcome kits, milestones and festival gifting for your team.",
    categoryHints: ["Welcome Kits", "Gift Sets", "Bottles", "Notebooks"],

    heroTitle: "Gifts That Mark the Moment",
    heroCopy:
      "Welcome kits, milestones, recognition and festival gifting — curated and branded for your team.",
    heroImage: null,
    mobileHeroImage: null,
    heroAlt: "Employee gifting kit composition, photography placeholder",

    challengeTitle: "Not Every Gift Needs a New Catalogue Search",
    challengeCopy:
      "Onboarding, recognition and festival gifting all call for something considered, without starting from scratch each time. We keep a curated set ready to brand.",
    challengePoints: [
      "Different moments need different gifts",
      "Consistent quality across occasions",
      "Curated, not generic",
      "Quick turnaround for recurring gifting",
    ],
    useCases: [
      "Onboarding",
      "Recognition",
      "Milestones",
      "Festival and team celebrations",
    ],

    recommendedProductIds: [
      "welcome-kit",
      "corporate-bottle",
      "executive-diary",
      "laptop-backpack",
      "executive-gift-set",
    ],
    recommendedCategories: [
      { id: "gifts", label: "Corporate Gifts" },
      { id: "kits", label: "Gift Kits" },
      { id: "bottles", label: "Bottles & Drinkware" },
      { id: "notebooks", label: "Notebooks & Diaries" },
    ],

    benefits: [
      { title: "Curated, Not Generic", description: "Ready combinations for common gifting moments." },
      { title: "Build Your Own", description: "Or choose your own products and budget." },
      { title: "Consistent Branding", description: "The same quality across every occasion." },
      { title: "Dedicated Support", description: "Help picking the right gift for the moment." },
    ],

    processSteps: [
      { title: "Tell us the occasion", description: "Onboarding, recognition, festival or milestone." },
      { title: "Choose products", description: "Pick a curated kit or build your own." },
      { title: "Preview your branding", description: "See your logo before you order." },
      { title: "Confirm quantity", description: "By team size or recipient count." },
      { title: "Receive quotation", description: "Pricing confirmed by our team." },
    ],

    /**
     * Employee Gifting is intent-specific (onboarding / recognition /
     * milestones), unlike the broad Corporate Gifting page — so both
     * feature blocks link prominently into it rather than duplicating its
     * collections here.
     */
    featureSections: [
      {
        id: "welcome-kits",
        title: "Welcome Kits",
        description: "Give every new joiner the same considered welcome, from day one.",
        art: "kit",
        color: "#3c4a63",
        ctaLabel: "Explore Welcome Kits",
        ctaTo: "/products/welcome-kit",
      },
      {
        id: "recognition-milestones",
        title: "Recognition & Milestones",
        description: "Mark work anniversaries, promotions and team wins with something worth keeping.",
        art: "giftbox",
        color: "#5c2733",
        ctaLabel: "Explore Corporate Gifting",
        ctaTo: "/corporate-gifting",
      },
    ],

    proofTestimonialId: null,

    primaryCtaLabel: "Request a Quote",
    secondaryCtaLabel: "Explore Corporate Gifting",
    secondaryCtaTo: "/corporate-gifting",

    finalCta: {
      title: "Planning Your Next Team Gift?",
      subtitle: null,
      ctas: [
        { type: "link", label: "Explore Corporate Gifting", to: "/corporate-gifting" },
        { type: "link", label: "Build Your Kit", to: { pathname: "/corporate-gifting", hash: "#build-kit" } },
      ],
    },
  },
];

export const solutionsBySlug = Object.fromEntries(
  solutions.map((solution) => [solution.slug, solution]),
);

export function getSolution(slug) {
  return solutionsBySlug[slug] || null;
}
