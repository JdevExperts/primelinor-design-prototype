# PrimeLinor Backend

Express 5 + Prisma + PostgreSQL API for the PrimeLinor B2B custom-products
marketplace. Covers the full current commercial workflow: public catalogue
(Products, Categories, Solutions), customer Lead/RFQ intake, staff
authentication, Admin catalogue management, quotation generation, and the
public customer quote page (view / PDF / Accept / Decline / Request
Revision). **Orders, checkout, and payment are explicitly out of scope for
this phase** — the commercial flow ends at quote acceptance; fulfillment
happens outside the app for now.

For production deployment steps, environment variables, the DB
backup/restore runbook, and the production bootstrap/data-promotion plan,
see [`DEPLOYMENT.md`](./DEPLOYMENT.md). This file covers local setup and
architecture.

## This backend requires its own PostgreSQL database

`DATABASE_URL` must point at a PostgreSQL database created for this
project — never the old `primelinor-bulk` legacy system's database (that
system is unrelated prior work; nothing here reads from or writes to it).

```bash
createdb primelinor_dev   # or your provider's equivalent
cp .env.example .env      # then fill in DATABASE_URL etc.
```

## Setup

```bash
npm install
npm run prisma:migrate     # creates tables in the database (dev workflow)
npm run seed                # loads a small dev-only demo product set
npm run staff:create -- --email=you@example.com --name="Your Name" --role=ADMIN
npm run dev
```

`npm run seed` is **dev-only demo data**, guarded to refuse
`NODE_ENV=production` (see `ALLOW_DEV_SEED` in `.env.example` and
`src/utils/seedGuard.js`) — it is not how a real production catalogue gets
populated. See `DEPLOYMENT.md` §4 for the production catalogue-promotion
and admin-bootstrap plan.

## Architecture

- **Catalogue**: `Product` ↔ `Category` is many-to-many via
  `ProductCategory`. Each product has a `primaryCategoryId` (controls PDP
  breadcrumb + canonical identity) plus optional secondary categories
  (discovery/merchandising, e.g. a product appearing under both "Apparel"
  and a themed Solution). Category filtering on `/products` uses the
  many-to-many join. Products/Categories/Solutions are all fully editable
  via Admin — no catalogue content requires a code deploy to change.
- **Solutions**: curated, named bundles of products aimed at a specific
  buyer need (e.g. "Employee Welcome Kits"), each mapped to real products
  via `SolutionProduct`, with an Admin-managed hero image and copy.
- **Commercial flow**: Browse → Product Detail Page → Request a Quote
  (creates a `Lead` + `RFQ`) → Admin Leads/RFQs screen → staff creates a
  `Quotation` (immutable once sent, versioned) → customer receives a
  `/quote/:token` link → views/downloads PDF → Accepts, Declines, or
  Requests a Revision → WhatsApp click-to-chat for follow-up. No cart, no
  checkout, no payment, no order management anywhere in this flow —
  deliberately deferred.
- **Auth**: Staff-only (`StaffUser`, roles `ADMIN` / `SALES`) — no public
  customer accounts. Session is an HttpOnly, SameSite=Strict JWT cookie
  (`Secure` in production), re-checked against the DB on every request so
  deactivating a `StaffUser` takes effect immediately without a token
  blocklist. `ADMIN` can write catalogue data; `SALES` handles the
  Lead/RFQ/quotation workflow but cannot mutate Products/Categories/
  Solutions.
- **Customization Studio**: product customization workflow
  (`/customize/:productId`) for `customizable=true` products with a valid
  `CUSTOMIZATION_FRONT` asset and `FRONT` placement zone
  (`studioReady` — see `services/studio` for the exact rule). Not every
  customizable product is Studio-ready yet; non-ready products still work
  through the standard Request-a-Quote flow.

## Environment variables

See `.env.example` for the full annotated list and `DEPLOYMENT.md` §2 for
which ones are hard-required in production (the server fails fast at
startup — `src/startup/validateConfig.js` — and refuses to boot with a
clear error listing everything missing, rather than starting
half-configured).

## Scripts (`backend/scripts/`, `backend/prisma/`)

All one-time/maintenance scripts refuse to run against
`NODE_ENV=production` unless they explicitly opt in via a dedicated env
flag (see each script's own header comment; the shared pattern lives in
`src/utils/backfillGuard.js` and `src/utils/seedGuard.js`). Classify
before running anything unfamiliar:

| Script | Class | Purpose |
|---|---|---|
| `prisma/seed.js` (`npm run seed`) | DEV_ONLY_GUARDED | Small demo catalogue for local dev |
| `prisma/createStaffUser.js` (`npm run staff:create`) | SAFE_PRODUCTION_TOOL (guarded) | The only way to create a `StaffUser` — see `DEPLOYMENT.md` §4c |
| `scripts/cleanupExpiredArtwork.js` (`npm run cleanup:artwork`) | SAFE_PRODUCTION_TOOL | Only ever deletes expired/abandoned `PENDING` artwork — safe in any environment by construction, intentionally unguarded |
| `scripts/cleanupPhase5TestData.js` | DEV_ONLY_GUARDED | Removes disposable local-dev test Leads/RFQs/Quotations |
| `scripts/backfillSolutions.js`, `backfillProductCategories.js`, `backfillCategoryImages.js`, `backfillLegacyCatalog.js` | DEV_ONLY_GUARDED | One-time catalogue migrations, already run against the current dev DB — kept for reference/re-run-on-fresh-DB scenarios |
| `scripts/uploadCatalogImages.js`, `promoteProductAssetsToS3.js` | DANGEROUS_IF_MISUSED | Bulk-writes S3 objects / rewrites `ProductAsset` rows — review the diff before running against any DB with real data |

## Existing production S3 images

Production S3 objects (real product photography) are not migrated,
copied, or renamed automatically by this codebase. `ProductAsset` rows
always carry a full `url`, so an asset row can point at any existing
object regardless of when/how it was uploaded.

## S3 bucket policy — required public-read prefixes

Managed catalogue images (Product/Category/Solution) are uploaded via this
backend's admin endpoints straight to S3 (`src/services/storage/*`), and
deliberately **never set a per-object ACL** — `putObject` in
`productAssetS3.js` relies entirely on the bucket's own policy for public
read access, since modern S3 buckets commonly have ACLs disabled
(Object Ownership: bucket-owner-enforced), where an explicit `public-read`
ACL would simply fail. This means **every environment's bucket** (dev,
staging, production) must carry a bucket policy granting public
`s3:GetObject` on each managed key prefix below, or newly uploaded images
will upload successfully but 404/403 for customers — exactly what happened
once for the `solutions/` prefix when Solutions became backend-managed
(the fix was additive: one more policy statement, nothing else touched).

Required public-read prefixes, one per managed asset type, matching the key
convention each service's `*AssetKeys.js` file generates:

| Prefix | Generated by | Public consumer |
|---|---|---|
| `products/*` | `services/storage/productAssetKeys.js` | ProductAsset (PDP/listing images) |
| `categories/*` | `services/storage/categoryAssetKeys.js` | Category nav/marketing image |
| `solutions/*` | `services/storage/solutionAssetKeys.js` | Solution hero image |
| `images/*` | legacy — predates this codebase's per-entity key convention | still-live real photography from the original catalogue import; not written by any current code path, but must stay public as long as any `ProductAsset.url` still points into it |

Minimal policy shape (`AWS_S3_BUCKET` is the bucket configured in `.env` —
**never hardcode a literal bucket name or paste real credentials into this
file or any commit**):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "PublicReadImages", "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::${AWS_S3_BUCKET}/images/*" },
    { "Sid": "PublicReadProducts", "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::${AWS_S3_BUCKET}/products/*" },
    { "Sid": "PublicReadCategories", "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::${AWS_S3_BUCKET}/categories/*" },
    { "Sid": "PublicReadSolutions", "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::${AWS_S3_BUCKET}/solutions/*" }
  ]
}
```

**This policy is per-bucket AWS account configuration, not something this
repo's code or migrations apply automatically.** Whoever provisions a new
environment's bucket (staging, production, or a fresh dev bucket) must add
these statements to that bucket's policy directly (AWS Console, CLI, or
whatever IaC the team uses) — deploying this backend against a bucket
missing one of these statements will silently succeed on upload and then
403 for every real customer request to that prefix. Adding a new managed
asset type in the future means adding one more `Resource` prefix here (in
this doc) and in that bucket's actual policy, the same way `solutions/*`
was added.

## Tests

```bash
npm test
```

Node's built-in test runner (`node --test`). No separate test-only DB
config — tests use the same `DATABASE_URL`-configured database, scoped to
their own fixtures.
