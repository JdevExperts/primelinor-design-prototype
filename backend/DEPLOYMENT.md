# PrimeLinor — Deployment, Backup, and Production Bootstrap

This doc covers what `backend/README.md` doesn't: the one-time and
per-deploy operational steps for taking this app to production. It does
not lock in a specific hosting provider — none has been chosen yet — so
steps are written provider-agnostically (works the same on a VM, a
container platform, or a PaaS with a build/start command).

## 1. Pre-deploy checklist

### Frontend

1. `cd frontend && npm install`
2. Set the production env (Vite only exposes `VITE_`-prefixed vars to the
   browser bundle — never put a secret in one). At minimum:
   `VITE_API_BASE_URL` pointing at the production backend origin.
3. `npm run build` → static output in `frontend/dist/`.
4. Deploy `dist/` to a static host / CDN. **SPA fallback routing is
   required** — every unmatched path must serve `index.html` (this is a
   client-side-routed React app; without a fallback, refreshing
   `/products` or any deep link 404s at the host level before React
   Router ever runs). Configure this at the host (e.g. a catch-all
   rewrite rule), not in application code.
5. Serve over HTTPS. If the frontend and backend are on different
   origins, HTTPS is required for `Secure` cookies to work at all.

### Backend

1. `cd backend && npm install --omit=dev` (or your platform's production
   install equivalent).
2. `npm run prisma:generate` (regenerates the Prisma client for the
   deploy target — do this even if `node_modules` was cached from a
   different platform/arch).
3. `npm run prisma:deploy` — runs `prisma migrate deploy`, which applies
   committed migrations only. **Never** run `prisma migrate dev` or
   `prisma db push` against production; both can prompt for or perform
   destructive schema changes outside the committed migration history.
4. Set every required production env var (§2 below). The app fails fast
   at startup (`src/startup/validateConfig.js`) and refuses to boot with
   a clear error listing everything missing, rather than starting in a
   half-configured state.
5. Start with `npm start` (`node server.js`) under a process manager or
   container orchestrator that restarts on crash. There's no bundled
   process-manager config (pm2/systemd/container restart policy — pick
   whichever fits the actual host).
6. Health check: `GET /health`. Returns `200 {"status":"ok"}` when the
   process is up **and** a real `SELECT 1` against the database
   succeeds; `503 {"status":"unavailable"}` if the DB is unreachable.
   Point your platform's health/readiness probe here.

### Database

- A dedicated production PostgreSQL instance/database, reachable from
  the backend via `DATABASE_URL`.
- Run `npm run prisma:deploy` (see above) once the DB exists and before
  first boot.
- See §3 for backup/restore and §4 for how a fresh production DB gets
  its catalogue and first admin account.

### S3 / object storage

- A real S3 bucket with the public-read policy documented in
  `backend/README.md` (`products/*`, `categories/*`, `solutions/*`, and
  `images/*` if any legacy-imported product still references it).
- Set `AWS_REGION`, `AWS_S3_BUCKET`, and either
  `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` or an equivalent runtime
  IAM role/credential mechanism your host provides. Production startup
  validation requires all three of `AWS_S3_BUCKET`,
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` to be set — customer
  artwork must never silently fall back to local disk in production
  (local disk storage is a dev-only convenience and doesn't survive a
  redeploy/restart on most hosts).
- Customer-uploaded artwork (`ArtworkAsset`) and managed catalogue
  images are not required to live in separate buckets, but if artwork
  should stay private rather than public-read, scope its key prefix out
  of the public bucket policy above and confirm the app doesn't assume
  public URLs for it (check `services/storage/*` before changing this).

### Domain / HTTPS / CORS

- **No production domain has been chosen yet** — this is a launch input
  from the business owner, not something to invent. Once picked:
  - Set `PUBLIC_APP_URL` to the canonical customer-facing frontend
    origin (used to build `/quote/:token` links — must be correct or
    shared quote links break).
  - Set `FRONTEND_ORIGIN` to the same origin(s), comma-separated if more
    than one (e.g. a staging + production frontend sharing one backend).
    Production CORS never allows `*` with credentials — only these
    explicit origins.
  - Update `frontend/public/robots.txt`'s `Sitemap:` line and confirm
    `backend`'s `PUBLIC_APP_URL` match the real domain (the sitemap is
    generated dynamically from `PUBLIC_APP_URL`, not hardcoded).
- HTTPS is required in production for `Secure` cookies
  (`src/services/auth.js`) to be sent at all — plan TLS termination
  (host-provided, reverse proxy, or CDN) before going live.

## 2. Required production environment variables

Set in the backend's production environment (never commit a filled-in
`.env`):

| Variable | Required in prod? | Purpose |
|---|---|---|
| `DATABASE_URL` | Always (every env) | Postgres connection string |
| `JWT_SECRET` | Yes | Signs the admin session cookie |
| `FRONTEND_ORIGIN` | Yes | CORS allowlist (comma-separated) |
| `PUBLIC_APP_URL` | Yes | Canonical frontend origin for quote links + sitemap |
| `AWS_S3_BUCKET` | Yes | Managed image + artwork bucket |
| `AWS_ACCESS_KEY_ID` | Yes | S3 auth |
| `AWS_SECRET_ACCESS_KEY` | Yes | S3 auth |
| `AWS_REGION` | Recommended | S3 region (defaults exist but confirm it matches the real bucket) |
| `WHATSAPP_NUMBER` | Only if WhatsApp CTA should be live | Digits + country code, e.g. `919812345678` — no `+`, no spaces |
| `SUPPORT_EMAIL` | Optional | Shown as a contact channel only if set |
| `NODE_ENV` | Yes, `production` | Enables all production-only guards (secure cookies, fail-fast config, script refusals) |
| `TRUST_PROXY` | If behind a reverse proxy | Set `1` so `req.ip` reflects the real client, not the proxy |

This list is enforced by `src/startup/validateConfig.js` — the server
won't boot in production with any of the always-required items missing,
and prints exactly what's missing.

## 3. Database backup / restore runbook

Pragmatic `pg_dump`/`pg_restore` — no managed-backup product assumed
(add one later if the eventual host offers automated snapshots; this is
the manual baseline every host supports).

### Backup

```bash
# Custom format (-Fc) — compressed, supports selective/parallel restore.
pg_dump -Fc --no-owner --no-privileges \
  "$DATABASE_URL" -f "primelinor_$(date +%Y%m%d_%H%M%S).dump"
```

- **Before every production deploy that includes a migration.** A
  pre-migration dump is the rollback path if a migration misbehaves.
- **On a periodic schedule** once live (daily is a reasonable starting
  point for a B2B catalogue + RFQ workload — adjust to actual write
  volume once observed). Store dumps somewhere durable and access
  controlled (not the same host/disk as the DB itself — a host failure
  should not take out both the DB and its backups).
- Retention: keep daily dumps for ~2 weeks and weekly dumps for ~3
  months as a starting policy; tighten or loosen once real usage
  patterns are known. Dumps contain customer PII (Lead/RFQ
  name/phone/email, quotation contacts) — treat them with the same
  access control as production DB credentials, never commit one to
  git, never park one in a public bucket.

### Restore

```bash
# Into a NEW empty database — never restore over a live DB in place
# without a fresh backup of *that* DB first.
createdb primelinor_restore_test
pg_restore --no-owner --no-privileges \
  -d "$(node -e "console.log(process.env.DATABASE_URL)" 2>/dev/null || echo 'postgresql://USER@HOST/primelinor_restore_test')" \
  primelinor_20260101_030000.dump
```

In practice, point `-d` at whatever connection string names the target
database (a plain `postgresql://user@host/dbname`, built by hand for
the restore target — not sourced from the live app's `DATABASE_URL`,
since restoring is usually into a *different* database than the one
currently running).

- **Test the restore path before you need it.** A backup nobody has
  ever restored is not a verified backup. Periodically (e.g. after any
  schema change, or monthly) restore the latest dump into a scratch
  database and sanity-check row counts / spot-check a few records.
- Restoring into the actual production database name (recovery
  scenario) additionally requires stopping the app first (avoid writes
  racing the restore) and running `prisma migrate deploy` afterward if
  the dump predates a migration that's since shipped.

Never put the real production DB password in this file, in a commit, or
in a script — always via the environment.

## 4. Production seed / bootstrap / data migration plan

This app's `prisma/seed.js` is **dev-only demo data** (a handful of
placeholder products/categories, guarded by `ALLOW_DEV_SEED` — see its
own header comment) and must never be run against a real production
database to "populate" it. A fresh production DB becomes usable via
these three separate steps instead:

### 4a. Schema

```bash
npm run prisma:deploy   # prisma migrate deploy — applies committed migrations only
```

### 4b. Catalogue data

The current local development database **is** the production-ready
catalogue source (Products, Categories, Solutions, and their images
have been through the Phase 6 completeness/cleanup passes). Promote it
via a full `pg_dump`/`pg_restore` of the catalogue tables (or the whole
DB, then delete any dev-only StaffUser/Lead/RFQ/Quotation test rows —
see `backend/README.md`'s dev/test data cleanup section) rather than
re-deriving it from scratch in production. There is no automated
import/export tool for a partial catalogue-only promotion today; if
that becomes a recurring need (e.g. repeated staging refreshes), a
dedicated pg_dump `--table` filter list or a JSON export/import script
would be the next step — not built now, since Phase 6B is a one-time
promotion, not a recurring pipeline.

**Object storage note:** catalogue rows store full S3 URLs
(`ProductAsset.url` etc.), not just keys. If production uses the
**same** S3 bucket as the promoted dev data was pointing at, no
remapping is needed. If production uses a **different** bucket
(recommended — keep dev and prod object storage separate), every
promoted row's image URL needs to be rewritten to the new bucket's
host, or the objects themselves need to be copied into the new bucket
at matching keys first. Decide bucket topology before promoting data,
not after — remapping URLs after the fact against a live production DB
is a bulk-update operation that deserves its own guarded script and a
fresh backup immediately before running it.

### 4c. First admin account

There is no seeded default admin (`prisma/seed.js` never creates a
`StaffUser` row — intentionally, to avoid a predictable baked-in
credential). The only way to create one is:

```bash
NODE_ENV=production ALLOW_ADMIN_BOOTSTRAP=true \
  node prisma/createStaffUser.js --email=you@company.com --name="Your Name" --role=ADMIN
```

(`npm run staff:create` runs the same script for non-production use —
in production, pass the env vars explicitly as above since the script
refuses to run in `NODE_ENV=production` otherwise.) Omit `--password`
to have the script generate a strong random one, printed to the
terminal exactly once — capture it immediately. The password is never
logged anywhere else and never re-printed on a later run.

The backend has a working `POST /api/v1/admin/auth/change-password`
endpoint, but **no admin UI page currently calls it** — there is no
"change my password" screen in the admin frontend today. Until that UI
exists, changing a staff password after the fact means re-running
`prisma/createStaffUser.js` is not an option (it refuses to overwrite
an existing email) — use `scripts/` tooling or a direct, guarded
one-off script if a reset is ever needed before the UI is built. Adding
the UI page is a small, low-risk P1 item, not built in this pass.

Run this once, from a trusted terminal with direct database access
(not committed to any CI log), immediately after `prisma:deploy`
succeeds and before the admin UI is advertised as live.
