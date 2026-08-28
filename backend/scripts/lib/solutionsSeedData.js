/**
 * One-time backfill source for the 10 launch Solutions (Solutions Phase A
 * §9/§37) — the historical content of what used to be
 * frontend/src/data/solutionsData.js + frontend/src/data/homeData.js's
 * `homeSolutionSlugs`, before Solutions became backend-managed data (§20).
 * Moved here (backend-owned, CommonJS) rather than left in the frontend,
 * same reasoning backfillLegacyCatalog.js keeps its own historical source
 * data (../../primelinorbulk_backup.sql) permanently in the repo: this file
 * is scripts/backfillSolutions.js's only source of truth and needs to stay
 * re-runnable against a fresh database, even though the live frontend no
 * longer imports Solution content from a static file at all.
 *
 * Order below is the intended /solutions hub merchandising order — not
 * alphabetical (becomes Solution.sortOrder). `homeSolutionSlugs`'s order is
 * a SEPARATE, independently-curated homepage order (becomes
 * Solution.homeSortOrder) — verified to genuinely differ from the hub order
 * for "startups" (2nd in the hub, 5th on the homepage).
 */

const solutions = [
  {
    slug: "corporate-teams",
    label: "Corporate Teams",
    eyebrow: "CORPORATE TEAMS",
    art: "polo",
    color: "#22304a",
    hubDescription:
      "Branded apparel and everyday work essentials for teams of every size.",

    heroTitle: "Branded Essentials Your Team Will Actually Use",
    heroCopy:
      "Create coordinated apparel, drinkware and work essentials with flexible quantities and consistent branding.",

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
      "executive-notebook",
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
    label: "Startups & Small Businesses",
    eyebrow: "STARTUPS & SMALL BUSINESSES",
    art: "tshirt",
    color: "#e3e6eb",
    hubDescription: "Launch merchandise and team apparel at founder-friendly quantities.",

    heroTitle: "Small Quantities Without Looking Small",
    heroCopy:
      "Start with 5–25 pieces, preview your logo in minutes, and scale up as your team grows.",

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
      "oversized-t-shirt",
      "pullover-hoodie",
      "canvas-tote",
      "a5-notebook-diary",
      "metal-pen",
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
    slug: "restaurants-hospitality",
    label: "Restaurants & Hospitality",
    eyebrow: "RESTAURANTS & HOSPITALITY",
    art: "polo",
    color: "#5c2733",
    hubDescription: "Staff apparel that looks the part, for cafés, restaurants and hotel teams.",

    heroTitle: "Staff Apparel That Looks the Part",
    heroCopy:
      "Branded polos, tees and caps for front-of-house and back-of-house teams — consistent across every shift and every location.",

    challengeTitle: "Your Team Is the First Thing Guests Notice",
    challengeCopy:
      "Cafés, restaurants and hotels need staff who look put-together from opening to close, across every outlet. We keep the look consistent without a complicated order process.",
    challengePoints: [
      "Consistent look across shifts and outlets",
      "Comfortable, durable everyday fabric",
      "Full size ranges for every team member",
      "Reorders that match your existing look",
    ],
    useCases: [
      "Front-of-house staff",
      "Kitchen and back-of-house teams",
      "Multi-outlet chains",
      "Seasonal and event staffing",
    ],

    recommendedProductIds: [
      "premium-polo",
      "cotton-round-neck",
      "classic-cap",
      "corporate-bottle",
      "corporate-staff-uniform-tshirt",
    ],

    benefits: [
      { title: "Consistent Branding", description: "The same look across every outlet and every shift." },
      { title: "Full Size Ranges", description: "Sized for a whole team, not a sample set." },
      { title: "Flexible Quantities", description: "Order for one outlet or several." },
      { title: "PAN India Supply", description: "Delivered wherever your locations are." },
    ],

    processSteps: [
      { title: "Tell us what you need", description: "Share your outlets, roles and rough quantities." },
      { title: "Choose products", description: "Pick from polos, tees, caps and drinkware." },
      { title: "Preview your branding", description: "See your logo before you order." },
      { title: "Confirm quantity", description: "Adjust per outlet or role." },
      { title: "Receive quotation", description: "Our team confirms pricing and dispatch." },
    ],

    featureSections: [
      {
        id: "front-of-house-apparel",
        title: "Front-of-House Apparel",
        description: "Polos and tees that keep your team looking consistent for every guest.",
        art: "polo",
        color: "#3c4a63",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
      {
        id: "multi-outlet-ordering",
        title: "Multi-Outlet Ordering",
        description: "The same look across every location, ordered and delivered together.",
        art: "cap",
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
      title: "Outfitting a Restaurant or Hospitality Team?",
      subtitle: null,
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

    heroTitle: "Uniforms and Campus Merchandise, Handled at Scale",
    heroCopy:
      "Uniforms, house and department apparel, and fest merchandise — ordered consistently across a full campus.",

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
      "school-uniform-polo-t-shirt",
      "cotton-round-neck",
      "college-batch-oversized-t-shirt",
      "pullover-hoodie",
      "laptop-backpack",
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
    slug: "delivery-field-teams",
    label: "Delivery & Field Teams",
    eyebrow: "DELIVERY & FIELD TEAMS",
    art: "backpack",
    color: "#3c4a63",
    hubDescription: "Branded gear for teams who are always on the move.",

    heroTitle: "Branded Gear Built for Teams on the Move",
    heroCopy:
      "T-shirts, polos, caps and bags for delivery, installation and field service teams — comfortable, consistent and easy to reorder.",

    challengeTitle: "Your Team Represents You at Every Doorstep",
    challengeCopy:
      "Delivery and field teams are the face of your brand outside the office. We help you keep that look consistent, comfortable and easy to reorder as your team grows.",
    challengePoints: [
      "Comfortable apparel for long shifts",
      "Consistent branding across every team member",
      "Easy reordering as headcount changes",
      "Full size ranges",
    ],
    useCases: [
      "Delivery riders and drivers",
      "Field service and installation teams",
      "Service crews",
      "New hire kits",
    ],

    recommendedProductIds: [
      "dry-fit-round-neck-t-shirt",
      "premium-polo",
      "classic-cap",
      "vacuum-insulated-bottle",
      "drawstring-bag",
    ],

    benefits: [
      { title: "Comfortable for Long Shifts", description: "Breathable fabrics built for teams on the move." },
      { title: "Consistent Branding", description: "The same look across every team member." },
      { title: "Flexible Quantities", description: "Order for a small crew or a full fleet." },
      { title: "PAN India Supply", description: "Delivered wherever your teams are based." },
    ],

    processSteps: [
      { title: "Tell us what you need", description: "Share your crew size and rough quantities." },
      { title: "Choose products", description: "Pick from tees, polos, caps and bags." },
      { title: "Preview your branding", description: "See your logo before you order." },
      { title: "Confirm quantity", description: "Adjust as your team changes." },
      { title: "Receive quotation", description: "Our team confirms pricing and dispatch." },
    ],

    featureSections: [
      {
        id: "everyday-field-apparel",
        title: "Everyday Field Apparel",
        description: "Comfortable tees and polos built for teams that are on their feet all day.",
        art: "tshirt",
        color: "#22304a",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
      {
        id: "team-essentials",
        title: "Team Essentials",
        description: "Caps and bags that round out a consistent, practical field kit.",
        art: "cap",
        color: "#3c4a63",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
    ],

    proofTestimonialId: null,

    primaryCtaLabel: "Request a Quote",
    secondaryCtaLabel: "Explore Products",
    secondaryCtaTo: "/products",

    finalCta: {
      title: "Outfitting a Delivery or Field Team?",
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

    heroTitle: "Merchandise Ready Before Your Event Date",
    heroCopy:
      "Event T-shirts, caps, bags and attendee kits — branded consistently and planned around your date.",

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
      "dry-fit-sports-t-shirt",
      "classic-cap",
      "corporate-bottle",
      "canvas-tote",
      "conference-kit",
    ],

    benefits: [
      { title: "Planned Around Your Date", description: "We work backwards from your event date, not a generic lead time." },
      { title: "Consistent Merchandise", description: "The same branding across every attendee kit." },
      { title: "Multiple Product Types", description: "Apparel, bags, drinkware and event kits in one order." },
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
    slug: "sports-teams-clubs",
    label: "Sports Teams & Clubs",
    eyebrow: "SPORTS TEAMS & CLUBS",
    art: "tshirt",
    color: "#22304a",
    hubDescription: "Performance apparel and team essentials for sports teams and clubs.",

    heroTitle: "Performance Apparel for Your Team",
    heroCopy:
      "Dry-fit T-shirts, caps and bottles branded for your team, club or squad — comfortable enough for practice and consistent enough for match day.",

    challengeTitle: "Every Team Wants to Look Like One",
    challengeCopy:
      "Sports teams and clubs need apparel that performs and looks consistent across every player. We keep sizing and branding uniform across the whole squad.",
    challengePoints: [
      "Consistent look across the whole squad",
      "Performance fabric for practice and play",
      "Full size ranges",
      "Simple reordering as the roster changes",
    ],
    useCases: [
      "Practice and training kits",
      "Club and society merchandise",
      "School and college sports teams",
      "Recreational and community leagues",
    ],

    recommendedProductIds: [
      "dry-fit-sports-t-shirt",
      "dry-fit-performance-t-shirt",
      "premium-sports-casual-t-shirt",
      "classic-cap",
      "vacuum-insulated-bottle",
    ],

    benefits: [
      { title: "Performance Fabric", description: "Dry-fit apparel built for practice and play." },
      { title: "Consistent Team Look", description: "The same branding and sizing across the whole squad." },
      { title: "Flexible Quantities", description: "From a small club to a full league." },
      { title: "PAN India Supply", description: "Delivered wherever your team trains or plays." },
    ],

    processSteps: [
      { title: "Tell us what you need", description: "Share your squad size and rough quantities." },
      { title: "Choose products", description: "Pick from dry-fit tees, caps, bottles and bags." },
      { title: "Preview your branding", description: "See your logo before you order." },
      { title: "Confirm quantity", description: "Adjust as the roster changes." },
      { title: "Receive quotation", description: "Our team confirms pricing and dispatch." },
    ],

    featureSections: [
      {
        id: "performance-apparel",
        title: "Performance Apparel",
        description: "Dry-fit T-shirts built for practice, training and match day.",
        art: "tshirt",
        color: "#3c4a63",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
      {
        id: "team-essentials",
        title: "Team Essentials",
        description: "Caps, bottles and bags that round out a consistent team kit.",
        art: "cap",
        color: "#22304a",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
    ],

    proofTestimonialId: null,

    primaryCtaLabel: "Request a Quote",
    secondaryCtaLabel: "Explore Products",
    secondaryCtaTo: "/products",

    finalCta: {
      title: "Outfitting a Team or Club?",
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

    heroTitle: "Gifts That Mark the Moment",
    heroCopy:
      "Welcome kits, milestones, recognition and festival gifting — curated and branded for your team.",

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
      "executive-notebook",
      "laptop-backpack",
      "executive-gift-set",
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
        { type: "link", label: "Build Your Kit", to: "/corporate-gifting#build-kit" },
      ],
    },
  },

  {
    slug: "retail-store-staff",
    label: "Retail & Store Staff",
    eyebrow: "RETAIL & STORE STAFF",
    art: "polo",
    color: "#dde1e8",
    hubDescription: "A consistent team look across every shift, store and counter.",

    heroTitle: "A Consistent Look Across Every Shift",
    heroCopy:
      "Branded polos, tees and caps for retail and store teams — the same look at every counter, outlet and shift.",

    challengeTitle: "Every Store Should Look Like the Same Brand",
    challengeCopy:
      "Retail teams need a consistent look across stores, shifts and new hires, without reordering from scratch each time. We keep sizing and branding consistent as your team grows.",
    challengePoints: [
      "Consistent look across stores and shifts",
      "Easy reordering for new hires",
      "Full size ranges",
      "Simple, repeatable branding",
    ],
    useCases: [
      "Store and counter staff",
      "Multi-store chains",
      "Seasonal and festive staffing",
      "New hire onboarding",
    ],

    recommendedProductIds: [
      "premium-polo",
      "eco-polo-t-shirt",
      "cotton-round-neck",
      "classic-cap",
      "corporate-staff-uniform-tshirt",
    ],

    benefits: [
      { title: "Consistent Branding", description: "The same look across every store and shift." },
      { title: "Full Size Ranges", description: "Sized for a whole team, not a sample set." },
      { title: "Easy Reordering", description: "Add new hires without starting from scratch." },
      { title: "PAN India Supply", description: "Delivered to every store, wherever it is." },
    ],

    processSteps: [
      { title: "Tell us what you need", description: "Share your store count, roles and rough quantities." },
      { title: "Choose products", description: "Pick from polos, tees, caps and uniforms." },
      { title: "Preview your branding", description: "See your logo before you order." },
      { title: "Confirm quantity", description: "Adjust per store or role." },
      { title: "Receive quotation", description: "Our team confirms pricing and dispatch." },
    ],

    featureSections: [
      {
        id: "store-staff-apparel",
        title: "Store Staff Apparel",
        description: "Polos and tees built for a full day on the floor.",
        art: "polo",
        color: "#3c4a63",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
      {
        id: "multi-store-ordering",
        title: "Multi-Store Ordering",
        description: "The same look across every store, ordered together.",
        art: "cap",
        color: "#22304a",
        ctaLabel: "Explore Products",
        ctaTo: "/products",
      },
    ],

    proofTestimonialId: null,

    primaryCtaLabel: "Request a Quote",
    secondaryCtaLabel: "Explore Products",
    secondaryCtaTo: "/products",

    finalCta: {
      title: "Outfitting a Retail or Store Team?",
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

    heroTitle: "Branded Products That Stay Visible",
    heroCopy:
      "Promotional products, campaign giveaways and event merchandise that keep your brand in hand after the campaign ends.",

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
      "sipper-tumbler",
      "metal-pen",
      "a5-notebook-diary",
      "promotional-merchandise-kit",
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
];

/** Homepage's own curated order — independently verified to differ from the hub order (§9 above). */
const homeSolutionSlugs = [
  "corporate-teams",
  "restaurants-hospitality",
  "schools-colleges",
  "delivery-field-teams",
  "startups",
  "events-conferences",
  "sports-teams-clubs",
  "employee-gifting",
];

module.exports = { solutions, homeSolutionSlugs };
