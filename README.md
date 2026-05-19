# Seven Generation Learning

A self-paced, web-based Learning Management System (LMS) for the Seven Generation Group. Multi-program platform — the first program shipping is **Claude at Work** (June–December 2026); the platform supports many programs running in parallel or sequentially.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Magic-link login, learner dashboard, program + module viewer (reference HTML ported) | ✓ |
| 2 | Quiz answer persistence, module completion persistence, exercise submission flow | ✓ |
| 3 | Manager scope, `/team`, `/reviews` queue with approve / request revision | ✓ |
| 4 | Admin dashboard, users CRUD, programs CRUD, module metadata CRUD, enrollment mgmt, CSV export | ✓ |
| 4.5 | Section composer (per-type forms), quiz CRUD, exercise CRUD, up/down reorder | ✓ |
| 5 | Submission email notifications, responsive TopBar, deploy docs | ✓ (partial — see "Not yet" below) |
| 6 | Completion certificates (PDF), bookmarking, module search | ✓ |

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

### 3. Apply the schema

```powershell
npm run db:apply-init
```

Pushes the bundled `prisma/init.sql` to Neon over HTTPS (port 443) using `@neondatabase/serverless`.

> **Why `db:apply-init` instead of `db:migrate`?** Many Philippine ISPs block outbound port 5432, which `prisma migrate` requires. Neon's WebSocket adapter routes everything through HTTPS, so it works on any network. If your network *does* allow 5432, run `npm run db:migrate` instead — it tracks migrations in a `_prisma_migrations` table for proper schema evolution. The `db:diff` script regenerates `prisma/init.sql` whenever `schema.prisma` changes.

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
npm run dev             # Next.js dev server
npm run typecheck       # tsc --noEmit
npm run db:apply-init   # apply prisma/init.sql via HTTPS (works on networks that block 5432)
npm run db:diff         # regenerate prisma/init.sql from current schema (no DB connection)
npm run db:migrate      # standard Prisma migrations (requires port 5432)
npm run db:seed         # rebuild seeded content
npm run db:reset        # wipe + re-migrate + re-seed (DANGER in prod)
npm run db:studio       # browse the DB visually
```

## Not yet built

- **Module unlock + submission reminder emails** — would need a cron job (Vercel cron / external scheduler) to scan daily for newly-unlocked modules and overdue submissions; deferred since the free tier has no cron.
- **Section view tracking** — schema is ready (`SectionView` table + `recordSectionView` action), no IntersectionObserver wired yet.
- **Audience rule materialization** — `Program.audienceRules` JSON is stored but the evaluator that turns rules into enrollments isn't built; admins currently enroll by individual or by entity/role bulk.

## Email setup

- Magic-link emails: handled by [`lib/email/magic-link.ts`](lib/email/magic-link.ts).
- Submission lifecycle: [`lib/email/notifications.ts`](lib/email/notifications.ts) — sent on submit (→ manager) and on review decision (→ learner).
- Without `RESEND_API_KEY`, every send falls back to a console log. Useful for dev.
- For production, set `RESEND_API_KEY` and a verified `EMAIL_FROM` domain in Resend. The free tier (100/day, 3000/month) is enough for ~200 learners at expected volume.

## Stack notes / decisions

- **Auth.js v5 beta** chosen over v4 stable for first-class Resend provider support and cleaner App Router integration. v5 has been beta for ~18 months and is what new docs target.
- **JWT sessions** (not DB sessions) — works on edge runtime and avoids a DB lookup per request. Role + `entityId` are baked into the JWT and re-fetched on sign-in.
- **Allowlist sign-in** — `lib/auth.ts` blocks sign-ins for emails not pre-provisioned in the `User` table. Admins add users via seed or (later) the admin UI.
- **Polymorphic Section blocks** — `Section.type` (enum) + `Section.content` (JSON). One Section row holds one block; the renderer groups consecutive rows under one logical heading (only the first carries `number`/`title`).
- **Relational progress tracking** — `ModuleProgress`, `SectionView`, `QuizAnswer` are separate tables (not JSON arrays on one `ProgressRecord`) so analytics queries stay simple.
- **Neon HTTPS adapter** — all Postgres traffic goes through `@neondatabase/serverless` over WebSocket on port 443, bypassing ISPs that block raw Postgres on 5432.
- **Admin preview** — users with `role = ADMIN` can open modules whose `availableFrom` is still in the future. Useful for content review before a program goes live.

## Deploying to Vercel

The app is a standard Next.js 16 deploy. Step by step:

1. **Push to GitHub.** Create a private repo and push the local `main` branch.
2. **Create a Vercel project** pointing at the repo. Framework auto-detects as Next.js.
3. **Set environment variables** in Vercel project settings:
   ```
   DATABASE_URL         = <production Neon pooled URL>
   AUTH_SECRET          = <fresh 32-byte random — do NOT reuse the dev secret>
   RESEND_API_KEY       = <production Resend API key>
   EMAIL_FROM           = noreply@your-verified-domain.com
   NEXTAUTH_URL         = https://your-vercel-domain.vercel.app
   ```
4. **Apply the schema** against the production Neon DB:
   ```powershell
   $env:DATABASE_URL="<production URL>"; npm run db:apply-init
   ```
   (Or `npm run db:migrate` if your network allows port 5432.)
5. **Seed entities + first admin only** (skip the demo manager/employee/submission):
   ```powershell
   $env:DATABASE_URL="<production URL>"; npm run db:seed
   ```
   Then edit the seeded admin user if needed, or invite via `/admin/users` once logged in.
6. **First deploy.** Vercel will build and surface the URL.
7. **Verify Resend deliverability.** Send yourself a magic link from the deployed login page; confirm it arrives.

**Vercel Hobby ToS note:** Strictly non-commercial. Acceptable in practice for ~200 internal users but consider Vercel Pro before going company-wide, or self-host on Render/Fly free tier as an alternative — Next.js 16 + Neon HTTPS works fine on those too.
