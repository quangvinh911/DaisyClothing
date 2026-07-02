# DaisyDaily - Developer Guidelines & AI Agent Commands

This file provides quick reference commands and guidelines for building, running, and developing the DaisyDaily application.

## Quick Start Commands

### Running Locally
Run both the frontend (Next.js) and backend (NestJS) concurrently:
```bash
npm run dev
```

### Server (NestJS) Commands
* **Start Server (Dev):** `npm run dev:server` (or `cd server && npm run start:dev`)
* **Build Server:** `cd server && npm run build`
* **Prisma Migrate:** `cd server && npm run prisma:migrate`
* **Prisma Generate:** `cd server && npm run prisma:generate`
* **Prisma Seed:** `cd server && npm run prisma:seed`
* **Prisma Studio:** `cd server && npm run prisma:studio`

### Client (Next.js) Commands
* **Start Client (Dev):** `npm run dev:client` (or `cd client && npm run dev` - runs on port 4200)
* **Build Client:** `cd client && npm run build`
* **Lint Client:** `cd client && npm run lint`
* **Clear Next Cache:** `Remove-Item -Recurse -Force client\.next` (PowerShell) or `rm -rf client/.next` (bash)

---

## Workspace Architecture

```
DaisyClothing/
├── client/              # Next.js Frontend (Runs on http://localhost:4200)
│   ├── src/app/         # Next.js App Router (uses group (public)/ and admin/)
│   └── src/lib/api.ts   # API Clients (points to NestJS Backend on Port 5000)
├── server/              # NestJS Backend (Runs on http://localhost:5000)
│   ├── src/             # NestJS Modules, controllers, services
│   └── prisma/          # Prisma schema, migrations, and seed scripts
└── package.json         # Workspace root package.json (concurrent script runners)
```

---

## Environment Configuration

* **Client `.env.local`**:
  * `NEXT_PUBLIC_API_URL="http://localhost:5000/api"`
  * `NEXT_PUBLIC_SITE_URL="http://localhost:4200"`
* **Server `.env`**:
  * `PORT=5000`
  * `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/daisydaily?schema=public"`

---

## Development & Code Guidelines
1. **Next.js & Routing**: Route groups are utilized (e.g. `(public)/page.tsx` renders `/`). 
2. **Next.js Compile Cache Issues**: If you experience mysterious `404 - This page could not be found` or TypeScript build issues (e.g. in `.next/dev/types/routes.d.ts`), stop the dev server, delete the `client/.next` cache folder, and restart.
3. **Data Fetching**: Always catch errors on public endpoint fetch promises (using `.catch(() => null)`) to leverage fallback structures if the database is unseeded or backend is offline.
4. **Secrets**: Never hardcode API keys or secrets. Always read from environment variables.
