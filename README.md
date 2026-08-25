# PrimeLinor

Full-stack B2B customization marketplace. Two independently deployable projects:

- **`frontend/`** — React + Vite customer and admin frontend.
- **`backend/`** — Express + Prisma + PostgreSQL API.

Neither has a filesystem dependency on the other; they only talk over HTTP.

## Development

```bash
cd backend && npm install && npm run dev    # terminal 1
cd frontend && npm install && npm run dev   # terminal 2
```

Or, from the repo root:

```bash
npm run dev:backend
npm run dev:frontend
```

See `frontend/README.md` and `backend/README.md` for project-specific setup (env vars, database, scripts).
