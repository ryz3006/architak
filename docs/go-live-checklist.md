# Go-live checklist — Admin Platform

Operational steps before production traffic. Code/report details: [`admin-platform-report.md`](./admin-platform-report.md).

## Done from engineering (this machine)

- [x] Required app/R2/admin env keys present (`pnpm env:check`)
- [x] Telegram keys stubbed in `.env.local` with `TELEGRAM_NOTIFICATIONS_ENABLED=false`
- [x] `pnpm typecheck` passed
- [x] `pnpm test:admin` / `node scripts/verify-admin-platform.mjs` passed
- [x] Production build verified with `NEXT_BUILD_CPUS=1` (avoids Windows multi-worker OOM)

## Blockers — action required (you)

### 1. Supabase project DNS is dead (blocking)

`NEXT_PUBLIC_SUPABASE_URL` points at `https://poouaypmslueamlukyok.supabase.co`.

Public DNS (Cloudflare 1.1.1.1) returns **NXDOMAIN** for that host. REST and `pnpm db:apply` both fail with `ENOTFOUND`.

**Fix:**

1. Open the live Supabase project `architak-media` (or restore/create it)
2. Copy the current Project URL + anon/publishable key + secret key into:
   - `.env.local`
   - Vercel project env (Production + Preview)
3. Put the DB password or pooler `DATABASE_URL` in `.env.local` (never commit)
4. Re-run: `pnpm db:apply`
5. Confirm tables exist: `seo_versions`, `project_testimonials`, extended enquiry statuses

Until this is fixed, CMS, enquiries persistence, SEO CMS, and Telegram after-hooks cannot reach Postgres.

### 2. Production public URLs (Vercel)

| Var | Local now | Production should be |
|-----|-----------|----------------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://architak.in` (or live domain) |
| `R2_PUBLIC_BASE_URL` | `workers.dev` CDN | `https://media.architak.in` after Worker custom domain |

### 3. Telegram (optional at cutover)

Keep disabled until ready:

1. Create bot via BotFather → token
2. Get chat/group ID
3. Set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
4. Set `TELEGRAM_NOTIFICATIONS_ENABLED=true` on Vercel
5. `/admin/settings` → send test message
6. Submit contact form → confirm enquiry row + Telegram + no customer-facing failure if Telegram down

### 4. Post-migration smoke (after DB is reachable)

1. `/admin/login` → Dashboard / Gallery / Projects / Enquiries / Website / SEO / Health
2. Upload one image (quota bar moves)
3. Assign cover on a project → Publish → `/work/[slug]` shows CMS content
4. Website Management publish → homepage Selected Work order updates
5. SEO save → view source title/description on public page
6. Contact form → lead in admin → (optional) Telegram

## Commands

```bash
pnpm env:check
pnpm db:apply
pnpm typecheck
pnpm test:admin
# Windows local builds:
#   $env:NEXT_BUILD_CPUS='1'; pnpm build
NEXT_BUILD_CPUS=1 pnpm build
```
