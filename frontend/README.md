# PrimeLinor — Frontend

React 19 + Vite customer-facing site and staff Admin console for the
PrimeLinor B2B custom-products marketplace. This talks to the
`backend/` API over HTTP and has no filesystem dependency on it. A
running backend (and its database) is required for every page beyond
static layout — the one exception is an explicit, dev-build-only opt-in
fixture mode (`VITE_USE_MOCK_CATALOG=true`, see Environment below) for
frontend-only work with no backend running; it can never activate in a
production build regardless of that flag's value (`api/catalog.js`
gates it on `import.meta.env.DEV`).

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173/ (with `backend` also running — see
`../backend/README.md`).

Other scripts: `npm run build`, `npm run preview`, `npm run lint`
(`oxlint`). Root-level `npm run verify` (from the repo root) chains
backend tests + this lint + this build in one command.

## Stack

React 19 + React Router 7 + Vite, plain CSS with CSS Modules — no UI
component library, no CSS framework. Inter is loaded from Google Fonts
in `index.html`.

## What this app actually does

This is the full production frontend, not a prototype — routing, live
API-backed data, customer commercial workflow, and a staff Admin console
are all real and working:

- **Public site**: Home, Product Listing (`/products`, filterable by
  category), Product Detail (`/products/:id`), Solutions hub
  (`/solutions`) and Solution Detail (`/solutions/:slug`), Corporate
  Gifting (`/corporate-gifting`), About, Contact, and a Customization
  Studio (`/customize/:productId`) for products with `studioReady`
  configuration.
- **Commercial flow**: Request a Quote from any PDP submits a real
  `Lead`/`RFQ` to the backend; a customer quote page
  (`/quote/:token`) renders a real, backend-generated quotation with
  PDF download and Accept / Decline / Request Revision actions.
- **Admin console** (`/admin`, cookie-session authenticated):
  Products, Categories, Colors, Solutions (full CRUD + image
  management), Leads inbox, RFQs inbox, and the Quotation editor. Role
  gating (`ADMIN` vs `SALES`) is enforced by the backend, not just
  hidden in the UI.
- **404 handling**: unmatched public routes render a real
  `NotFound` page; unmatched admin routes redirect to
  `/admin/rfqs`.

## Structure

```
src/
  api/            fetch wrappers + response adapters — the ONLY place
                  that talks to the backend (catalog.js, leads.js,
                  rfqs.js, quotes.js, submission.js, uploads.js)
  data/           siteConfig.js (business contact, socials — see below),
                  catalogData.js / homeData.js (category + homepage
                  copy, not fabricated content), productDetail.js,
                  companyData.js, corporateGiftingData.js
  components/
    layout/       AnnouncementBar, Header (+ mega menu), Footer, Logo,
                  SiteLayout (site chrome + Organization JSON-LD), Seo
                  (per-route <title>/meta/canonical/OG component)
    home/         Hero, ProductExplorer, CategoryGrid,
                  SolutionsForEveryTeam, HowItWorks, TrustSection,
                  FinalCTA
    product/      PDP sections (details, sizes, related products, etc.)
    catalogue/    Product Listing filters/grid
    solutions/    Solutions hub + detail sections
    gifting/      Corporate Gifting page sections
    customizer/   Customization Studio preview + garment mockup
    ui/           Button, ProductCard, CategoryCard, SectionHeader,
                  Section, ProductVisual, Icon
    common/       shared small pieces (loading/error states, etc.)
  pages/          one file per route (see App.jsx for the exact map)
  admin/          separate app shell: admin/api, admin/components,
                  admin/context (auth), admin/pages
  utils/          pure helpers (filterProducts, studio placement math,
                  giftKit, productDetail shaping)
```

`src/data/mockData.js` still exists but is now just a thin re-export
barrel (`export * from "./catalogData"`, `"./homeData"`, `"./siteConfig"`)
— a leftover name from the original design-prototype era. It re-exports
real structural data (category labels, listing sort options, business
config), not fabricated content; the misleading filename is a minor,
non-blocking cleanup item.

## Business contact configuration

Phone, WhatsApp number, support email, and social links (Instagram,
YouTube, Google Maps/reviews) are centralized in
`src/data/siteConfig.js` — **no component hardcodes a literal phone
number, email, or social URL**. To change any of these for launch,
edit that one file (see `backend/DEPLOYMENT.md` for the equivalent
backend-side `WHATSAPP_NUMBER`/`SUPPORT_EMAIL` env vars, which the
public API also exposes via `GET /api/v1/config/public`).

## SEO

Per-route metadata (title, description, canonical, Open Graph, robots)
is handled by `components/layout/Seo.jsx`, mounted once per page with
page-specific props — no `react-helmet`-style dependency, just a direct
`<head>` tag upsert matching this codebase's existing
`document.title`-in-`useEffect` convention. Canonical/OG URLs are
always derived from `window.location.origin` at runtime, never a
hardcoded domain (no production domain has been chosen yet — see
`backend/DEPLOYMENT.md`). `/quote/:token` and `/customize/:productId`
are explicitly `noindex`. A site-wide `Organization` JSON-LD block is
injected once by `SiteLayout.jsx`. The sitemap (`/sitemap.xml`) and
`robots.txt` are documented in `backend/README.md` /
`backend/DEPLOYMENT.md`.

## Environment

Only `VITE_`-prefixed variables are exposed to the browser bundle (Vite
convention) — never put a secret in one. See `.env.example`:
`VITE_API_BASE_URL` (backend origin) and `VITE_USE_MOCK_CATALOG`
(dev-build-only fixture-data opt-in, ignored entirely in production
builds).
