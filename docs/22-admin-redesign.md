# Admin Redesign — IA, CMS, Analytics & Security

This document records the architecture decisions behind the admin platform
redesign. It complements `docs/09-admin-dashboard-information-architecture.md`
and `docs/13-security-model.md`.

## Goals

- A business-user-friendly admin: simple navigation, guided empty states, and
  charts instead of raw numbers.
- Full CMS coverage of public copy so non-developers can edit "every component"
  of the site.
- Hardened session security (idle logout, revocation, durable rate limiting,
  CSRF) while keeping the single shared static credential.
- The public site's look, motion and performance stay untouched.

## Design system (admin-only)

- UI primitives are hand-rolled shadcn-style components on individual Radix
  packages, under `components/admin/ui/*`. They are scoped by admin tokens in
  `styles/admin.css` (imported from `app/globals.css`) so the public site's
  editorial styling is unaffected.
- Charts are Recharts wrappers under `components/admin/charts/*` using a
  token-driven palette (`palette.ts`).
- `lib/cn.ts` now composes with `clsx` + `tailwind-merge`.
- Toasts use `sonner`; the command palette uses `cmdk`.

## Navigation & shell

- `lib/admin/nav.ts` defines a grouped, task-oriented IA (Overview, Content,
  Leads, Growth, Operations, System) plus breadcrumb resolution.
- `components/admin/shell.tsx`: sticky grouped sidebar, top bar with breadcrumbs
  + page title + user menu, mobile drawer (Radix Sheet), and a Cmd/Ctrl+K
  command palette (`components/admin/command-menu.tsx`).

## Analytics dashboard

- `features/analytics/admin.ts` aggregates enquiry trends (30-day, zero-filled),
  the enquiry status pipeline, project status/category breakdowns, and a recent
  activity feed from `audit_events`.
- `app/admin/(dashboard)/page.tsx` renders KPI stat cards (with sparklines),
  charts, recent enquiries, activity and alerts.

## CMS content model

Content resolution is **CMS-first with static fallback** via deep-merge, so the
public site always renders and edits appear on publish.

- **Page copy** (home, studio, services, contact) → `pages.content` JSONB.
  Public reads use the publishable (anon) client (RLS: published pages only);
  admin reads/writes use the secret client. Stored as a **partial override**
  deep-merged over the bundled `content/static/site.json`.
- **Global lists** (testimonials, featured videos, social links, studio contact
  details, services) → `site_settings` keys under `content.*`. `site_settings`
  stays deny-all; both public and admin reads use the secret client on the
  server (same pattern as `website.sections`).
- **Project narrative** → `projects.body` JSONB (intro + sections), edited in
  the project editor and rendered on `/work/[slug]`.

Key modules:

- `features/content/store.ts` — `deepMerge`, page/setting read + write (auth'd),
  audit + revalidation.
- `features/content/schema.ts` — Zod schemas validated at the save boundary.
- `features/content/site-content.ts` — CMS-first public getters (request-cached)
  that mirror the old static getters; public pages import these.
- `features/content/admin.ts` — editor initial values (static merged w/ override).
- `features/content/actions.ts` — server actions per section.

Editors live under `components/admin/content/*` and routes under
`app/admin/(dashboard)/content/*` (Pages hub, per-page editors, Business
details, Services, Videos, Testimonials).

> **Boundary:** hero image sets, hero journeys and motion configs remain
> code-managed (they are tied to bundled media and motion tuning). All editorial
> copy, lists and project narratives are CMS-editable.

## Session security

Stateless HMAC-signed cookie, hardened:

- **Lifecycle** (`features/auth/session-token.ts`): tokens carry `iat`, absolute
  `exp`, sliding `idle`, and a revocation `v` (epoch).
- **Edge gate** (`proxy.ts`): document GET navigations to `/admin/*` are checked
  at the edge; unauthenticated users are redirected to login and valid sessions
  get a refreshed idle window (sliding). Server code remains authoritative.
- **Revocation** (`features/auth/revocation.ts`): a session epoch in
  `site_settings`; "sign out everywhere" bumps it, invalidating all tokens.
  Checked in `requireAdminSession` (cached ~30s).
- **Idle auto-logout** (`components/admin/idle-logout.tsx`): client timer warns
  then signs out after inactivity.
- **Login audit** (`features/auth/audit.ts`): success/failure recorded to
  `audit_events` with IP + user agent; shown on the Security page.
- **CSRF** (`lib/security/csrf.ts`): same-origin assertion on login and
  revocation actions.
- **Durable rate limiting** (`lib/security/rate-limit.ts`):
  `checkRateLimitDurable` uses Upstash Redis REST when configured, else the
  in-memory limiter. Login uses a dedicated stricter window.

Admin → **Security** (`app/admin/(dashboard)/security/page.tsx`) surfaces the
current session, protections, credential strength, and recent sign-in activity.

## Environment

New variables (see `.env.example`): `SESSION_IDLE_TIMEOUT_MINUTES`,
`SESSION_ABSOLUTE_TIMEOUT_HOURS`, `LOGIN_RATE_LIMIT_WINDOW_MS`,
`LOGIN_RATE_LIMIT_MAX`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

## Build note

On memory-constrained machines, `next build` can exhaust resources while
spawning static-generation workers. Use the existing `NEXT_BUILD_CPUS` escape
hatch (e.g. `NEXT_BUILD_CPUS=2`) — it maps to `experimental.cpus` in
`next.config.ts`.
