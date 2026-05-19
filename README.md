# Seven Generation Learning

A self-paced, web-based Learning Management System (LMS) for the Seven Generation Group. Multi-program platform — the first program shipping is **Claude at Work** (June–December 2026); the platform supports many programs running in parallel or sequentially.

## Status — Phase 1 (Foundation)

| ✓   | Acceptance criterion                                                                  |
|-----|----------------------------------------------------------------------------------------|
| ✓   | Magic-link login (Resend in prod, console log in dev — no API key required to start)  |
| ✓   | Learner dashboard listing enrolled programs                                            |
| ✓   | Program detail page with module list                                                   |
| ✓   | Module viewer rendering all sections, quizzes, and exercise from DB                    |
| ✓   | Visual style ports the reference HTML at `OneDrive/LMS/Module-01-Meet-Claude.html`    |

Phase 2+ (interactive progress persistence, manager review, admin composer) is **not yet implemented** — see project brief.

## Tech stack

- **Next.js 16.2** (App Router, React 19, TypeScript strict)
- **Tailwind CSS 4** (CSS-first `@theme` config in `app/globals.css`)
- **Prisma 6** + **PostgreSQL** (Neon free tier in prod)
- **Auth.js v5** (NextAuth beta 31) with **Resend** magic-link provider
- **DM Sans / DM Mono / DM Serif Display** (via `next/font/google`)
- **Lucide React** for icons

All free-tier services. No paid SaaS.

## Local setup

### 1. Install dependencies

```powershell
npm install
```

> On Windows / PowerShell the default execution policy may block `npm.ps1`. Either invoke `npm.cmd` explicitly, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

### 2. Configure environment

Copy `.env.example` to `.env` (or edit the existing `.env`) and fill in:

```
DATABASE_URL=...     # Neon connection string, with ?sslmode=require
AUTH_SECRET=...      # 32+ char random string  (openssl rand -base64 32)
RESEND_API_KEY=      # leave blank in dev → magic links print to console
EMAIL_FROM=onboarding@resend.dev
NEXTAUTH_URL=http://localhost:3000
```

Getting a Neon URL takes a minute:

1. Sign up at <https://console.neon.tech>
2. Create a new project (free tier)
3. Copy the **pooled** connection string (already includes `?sslmode=require`)
4. Paste into `DATABASE_URL`

### 3. Migrate the database

```powershell
npm run db:migrate
```

Creates the schema in your Neon database and stamps a migration in `prisma/migrations/`.

### 4. Seed it

```powershell
npm run db:seed
```

This creates:

- 4 entities (M2, MMI, RDB, 7GEN shared services)
- 1 admin user — **`kat.vizconde@seven-gen.com`** (Kat Vizconde, role: ADMIN)
- 1 program — **Claude at Work** (Jun 1 → Dec 31, 2026)
- 1 enrollment for the admin user
- Module 01 — *Meet Claude* — fully populated from the reference HTML (13 section rows, 3 quizzes, 1 exercise)
- Module 02 — *Prompting Basics* (placeholder for the "Coming Next" footer)

Re-running `db:seed` is idempotent for entities/users/program. Module 01 is rebuilt on each run.

### 5. Run the dev server

```powershell
npm run dev
```

Visit <http://localhost:3000>. You'll be redirected to `/login`.

### 6. Sign in (dev mode)

1. Enter `kat.vizconde@seven-gen.com` in the login form.
2. **Look at your terminal** — the magic-link URL is logged there (because `RESEND_API_KEY` is empty).
3. Click or paste the URL into your browser.
4. You're in.

> Only emails that already exist in the `User` table can sign in. To add more test users, run `npm run db:studio` and add them by hand, or extend `prisma/seed.ts`.

## Project layout

```
app/
  (learner)/                      Authed learner routes (auth guard in layout)
    dashboard/                    All my programs + completion %
    programs/[slug]/              Program with module list
      modules/[position]/         Module viewer
  api/auth/[...nextauth]/         Auth.js handlers
  login/                          Magic-link request form + check-email screen
components/
  learner/                        TopBar, SignOutButton
  module/                         Hero, SectionRenderer, QuizBlock, ExerciseBlock, etc.
lib/
  auth.ts                         Auth.js v5 config (Resend + DB-allowlist sign-in)
  db.ts                           Prisma singleton
  cn.ts                           clsx + tailwind-merge helper
  email/magic-link.ts             Magic-link HTML + Resend sender (or console fallback)
  section-content.ts              TypeScript shapes for Section.content JSON
prisma/
  schema.prisma                   Full LMS data model
  seed.ts                         Seed script (Module 01 ported from reference HTML)
types/
  next-auth.d.ts                  Auth.js module augmentation (role + entityId on session)
```

## Useful commands

```powershell
npm run dev           # Next.js dev server
npm run typecheck     # tsc --noEmit
npm run db:migrate    # create/apply migrations
npm run db:seed       # rebuild seeded content
npm run db:reset      # wipe + re-migrate + re-seed (DANGER in prod)
npm run db:studio     # browse the DB visually
```

## What's NOT in Phase 1 (planned)

Per the project brief, these are deliberately deferred:

- Quiz answer persistence (currently client-state only)
- Section view tracking (`SectionView` table is in schema, no writes yet)
- Module completion persistence (`Mark complete` is client-state only)
- Exercise submission + manager review queue
- Admin program/module composer UI
- Admin user + enrollment management
- Email notifications beyond magic links
- Audience rule materialization (`audienceRules` JSON is stored; evaluator not built)
- CSV export

See the phase plan in the project brief.

## Stack notes / decisions

- **Auth.js v5 beta** chosen over v4 stable for first-class Resend provider support and cleaner App Router integration. v5 has been beta for ~18 months and is what new docs target.
- **JWT sessions** (not DB sessions) — works on edge runtime and avoids a DB lookup per request. Role + `entityId` are baked into the JWT and re-fetched on sign-in.
- **Allowlist sign-in** — `lib/auth.ts` blocks sign-ins for emails not pre-provisioned in the `User` table. Admins add users via seed or (later) the admin UI.
- **Polymorphic Section blocks** — `Section.type` (enum) + `Section.content` (JSON). One Section row holds one block; the renderer groups consecutive rows under one logical heading (only the first carries `number`/`title`).
- **Relational progress tracking** — `ModuleProgress`, `SectionView`, `QuizAnswer` are separate tables (not JSON arrays on one `ProgressRecord`) so analytics queries stay simple.

## Deploying

Not in Phase 1 scope. When ready:

1. Create a Vercel project pointing at this repo
2. Set the same env vars in Vercel (DATABASE_URL pointing to production Neon, real `AUTH_SECRET`, real `RESEND_API_KEY`, verified `EMAIL_FROM` domain)
3. `npm run db:migrate` once against the production DB
4. (Optional) `npm run db:seed` against production for entities + first admin only
