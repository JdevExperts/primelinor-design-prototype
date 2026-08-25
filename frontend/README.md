# PrimeLinor — Design Prototype

A standalone **visual design prototype** for the PrimeLinor website redesign. This is
not the production site and shares no code with it.

Scope of this pass: the design system foundation plus **Homepage V5** (desktop-first,
responsive). No other pages exist yet.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173/

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## Stack

React 19 + Vite, plain CSS with CSS Modules. No UI component library, no CSS
framework, no template. Inter is loaded from Google Fonts in `index.html`.

## Structure

```
src/
  styles/
    tokens.css        design tokens (colour, type, spacing, radius, shadow, motion)
    globals.css       reset, base typography, container + accessibility helpers
  data/
    mockData.js       ALL placeholder content — products, prices, MOQs, testimonials
  components/
    layout/           AnnouncementBar, Header (+ mega menu), Footer, Logo
    home/             Hero (campaign banner wall), ProductExplorer, CategoryGrid,
                      TryYourLogo, CreationTypes, BusinessUseCases,
                      CorporateGifting, HowItWorks, TrustSection, FinalCTA
                      (listed in the order Home.jsx renders them)
                      CampaignBanner is the reusable hero tile
    customizer/       CustomizationPreview + GarmentMockup (Try Your Logo only)
    ui/               Button, ProductCard, CategoryCard, SectionHeader, Section,
                      ProductVisual, Icon
  pages/
    Home.jsx
```

## Page width

`.container` is a wide marketplace shell: `--container-max` 1440px with
`--container-pad` scaling to 56px, so wide desktops get roughly 1330px of content
and 1920px still keeps real gutters. Below 1280px nothing changed.

The homepage explorer pages through `catalogueProducts` locally (12 per desktop
page, 6 on small screens) so only the current page is in the DOM. View all
products is a placeholder until the Product Listing page exists.

Grids are meant to use that full width; running text is not. Text blocks pull
themselves back in with a `ch` max-width on the element, and full-bleed surfaces
that would look stretched (the closing CTA) cap themselves at `--container-narrow`.

## Homepage campaign banners

The hero is a data-driven campaign wall (`heroCampaigns` in `mockData.js`), not
coded marketing copy. Each record maps to a future admin/API field:

`id`, `placement`, `title` (internal), `altText`, `desktopImage`, `mobileImage`,
`href`, `isActive`, `sortOrder`, optional `objectPosition`.

Set `desktopImage` / `mobileImage` to a public path such as
`/images/banners/apparel-desktop.webp` (files live in `public/`) or an imported
asset. Null images render a labelled studio placeholder. Inactive records are
not shown.

Recommended creative ratios — design the artwork to match the slot so
`object-fit: cover` does not crop embedded campaign text:

| Slot | Desktop | Mobile |
| --- | --- | --- |
| `hero_primary` | ~2:1 landscape | ~2:1 |
| `hero_secondary_1` / `_2` | ~1.7:1 landscape | ~1.7:1 |

Desktop layout is one primary (~68%) plus two stacked secondaries (~32%).
Below 768px the three campaigns stack: primary, then secondary 1, then
secondary 2. `mobileImage` is selected with `<picture>` when provided;
otherwise the desktop file is used.

Do not overlay HTML headlines or CTAs on the creative. The image is the
campaign; the banner is a click target with accessible `altText`.

## Customization imagery (studio)

Try Your Logo on `/customize/:productId` is **image-first**. Controlled product
photos are the accurate branding surface. Vector `GarmentMockup` is fallback only.

### Fallback order

1. Selected-colour `productFront` / `productBack`
2. Product `defaultColor` asset (when that colour has no pack of its own)
3. Vector garment mockup

Lifestyle / model / team images never receive automatic artwork overlay unless the
asset sets `supportsLogoOverlay` and calibrated `modelPlacementZones` (or
`placementZones` on the model gallery item). Those coordinates are independent of
product-photo zones. Team / lifestyle images stay reference photography.

Studio UI labels are customer-facing (`Left Chest`, `Center`, `Upper Back`,
`Center Back`). Homepage Try Your Logo keeps wearer-perspective names.

### Controlled product photo guidelines

For accurate overlay, `productFront` and `productBack` should be:

- front- or back-facing, centered, full product visible
- plain / studio background, even lighting, little perspective
- consistent crop between front and back of the same colour
- high resolution, no existing logo, margin around the product

Use `object-fit: contain`. Do not crop the garment in a way that invalidates
percentage placement zones (`cx`, `cy`, `w`, `h` of the image frame).

If a colour’s photo has a different crop, put `placementZones` on that colour’s
asset. Shared zones live on the product record.

### Same-model guideline

Across colours of one product, prefer the same model, pose, framing, lighting and
background so White → Navy does not change the person in the photo.

### File locations

Prototype files: `public/images/products/{slug}/{color}-{view}.png`

Examples:

- `/images/products/polo/navy-front.png`
- `/images/products/polo/navy-back.png`
- `/images/products/polo/navy-model.png`

Swap in real PrimeLinor photography by changing `src` in
`src/data/productAssets.js`. Catalogue cards keep using listing `image` / `art`
and do not load these lifestyle assets.

Admin-ready fields already on each asset (mock only): `src`, `alt`, `active`,
`sortOrder`, `objectFit`, `aspectRatio`, `placementZones`,
`supportsLogoOverlay`, `type`, `label`.

## Logo placement semantics


Try Your Logo uses a dedicated mockup system (`customizer/`), not `ProductVisual`.
Print zones live on each entry in `customizableProducts` as percentages of the
mockup surface (`cx`, `cy`, `w`, `h`). Uploaded artwork is contained inside the
active zone and never stretched.

Placement names on the homepage demo come from the **wearer's** perspective.
On a front-facing garment that mirrors, so `cx` is above 50 for the wearer's
left and below 50 for their right. The Customization Studio uses the same
coordinates with customer-facing labels (`Left Chest`, `Center`, `Upper Back`,
`Center Back`). `printPlacements[key].view` is `"front"` or `"back"` and
switches the mockup accordingly — a back placement is never previewed on a
front garment.

## Imagery

`ui/ProductVisual` is the single image primitive. It renders an `<img>` when a `src`
is provided and otherwise draws a neutral studio-style illustration for the given
product type. Every entry in `mockData.js` already carries an `image: null` field, so
dropping in real photography is a data change — no layout work required.

Three things worth knowing when working with it:

- **Illustrations are normalised.** Each art key has an entry in `ART_BOX`, and the
  component scales and translates the drawing so every product shares one footprint
  and one floor line. Add a new illustration and its bounds together.
- **`surface`** picks the studio backdrop (`default`, `tint`, `warm`, `dark`). Pale
  products are moved to a deeper variant automatically so they do not wash out.
  Surfaces are ignored once a real photo is supplied.
- **Frame shape is responsive.** Consumers pass `ratio`, but any ancestor can set
  `--visual-ratio-override` in a media query to retune the frame per breakpoint.

## What is deliberately not built

No backend, database, auth, payments, RFQ submission, WhatsApp API, search, routing,
product listing/detail pages, gifting page, kit builder, or the full Try Your Logo
editor. Buttons are visual placeholders.

## Placeholder data warning

Every price, MOQ, rating, company name and testimonial in `mockData.js` is invented
for layout purposes and must be replaced with real, verified data before anything is
published.
