# PrimeLinor Backend — Phase 1 (Catalog)

A new Express 5 + Prisma + PostgreSQL backend, built alongside the existing
frontend prototype. **This is Phase 1 only: a public, read-only catalog
API.** RFQ, uploads, auth, and admin are explicitly out of scope — see the
project's phased architecture doc.

## This backend requires its own NEW database

`DATABASE_URL` must point at a **fresh PostgreSQL database created for this
project** — never the old `primelinor-bulk` production database. That old
database is reference-only; nothing here reads from or writes to it, and no
migration/cutover is attempted by this codebase.

```bash
createdb primelinor_dev   # or your provider's equivalent
cp .env.example .env      # then fill in DATABASE_URL etc.
```

## Setup

```bash
npm install
npm run prisma:migrate   # creates tables in the NEW database
npm run seed              # loads a small dev-only product set
npm run dev
```

## Existing production S3 images

Production S3 objects (real product photography) are **not migrated,
copied, or renamed by this codebase.** `ProductAsset.storageKey` is
nullable specifically so an asset row can reference an existing object by
`url` alone — selected real products/images will be recreated manually in
this new schema later, per the project's explicit no-auto-migration
decision. `src/services/s3.js` only builds a URL from a key if
`S3_BASE_URL` is configured; it does not upload, delete, or list anything.

## Scope boundary

Not implemented here (see the phased architecture doc for when):
RFQ/Lead endpoints, file uploads, authentication, admin write endpoints,
quotations, WhatsApp, orders.
