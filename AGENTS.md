# DaisyDaily - Developer Guidelines & AI Agent Commands

This file provides quick reference commands and guidelines for building, running, and developing the DaisyDaily application.

## Task Sizing & Execution Policy

Before starting implementation, classify the request using the smallest reasonable tier. Base the tier on affected systems, risk, and uncertainty rather than line count alone. Time targets are guidelines, not guarantees.

### Small Tasks

Typical scope: a clear, low-risk change in 1–3 files with no schema, authentication, deployment, or architectural impact.

* Aim to complete within **3–5 minutes**.
* Do not use sub-agents unless they clearly reduce elapsed time.
* Inspect only directly relevant files.
* Implement the minimum correct change and avoid unrelated cleanup.
* Run one targeted verification pass, such as linting the changed file or running the narrowest relevant test.
* Do not run full builds, browser QA, broad audits, or service restarts unless the change specifically requires them.

### Medium Tasks

Typical scope: several related files, one frontend/backend boundary, a contained API change, or moderate behavioral risk.

* Aim to complete within **5–15 minutes**.
* Use a short plan with only the necessary implementation and verification steps.
* Use at most one focused sub-agent when there is genuinely independent work that saves time.
* Inspect the touched flow end-to-end, but avoid repository-wide audits.
* Run focused checks for each changed surface and one integration or build check when the boundary requires it.
* Restart services only when the running process must load newly compiled code or live verification is necessary.

### Large or Complex Tasks

Typical scope: architecture changes, database migrations, authentication/security work, deployment, broad refactors, multiple integrations, or high uncertainty.

* Create an explicit staged plan before implementation.
* Use parallel sub-agents for independent research, implementation, or verification tracks when they materially reduce elapsed time.
* Provide concise progress updates at meaningful milestones.
* Validate in proportion to risk, including relevant builds, tests, migrations, integration checks, and rollback considerations.
* Do not impose an arbitrary short deadline; prioritize correctness while avoiding redundant investigation and repeated checks.

### Universal Guardrails

* Start at the smallest plausible tier. If discovery requires a larger tier, briefly state the concrete reason before expanding the work.
* If the user describes a task as simple, treat it as small unless a specific technical or safety constraint requires otherwise.
* Do not add optional features, cleanup, audits, or refactors that are not needed for the requested outcome.
* Use sub-agents only when parallelism is likely to save wall-clock time; delegation is not a default requirement.
* Run the narrowest sufficient verification. Do not repeat successful builds or tests without a concrete reason.
* Stop when the requested outcome is implemented and adequately verified.

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
