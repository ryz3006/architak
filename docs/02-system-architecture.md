# System Architecture

## Shape

**Single Next.js App Router application** (modular monolith). Deployed on Vercel. Data on Supabase Postgres (`architak-media`). Media on Cloudflare R2 bucket `architak-media` (private by default).

```text
Visitor / AI crawlers / Staff
        │
        ▼
   Next.js (Vercel)
   ├── (public)    Server Components, SEO, discovery
   ├── (admin)     Static session → CMS
   └── api         Signed uploads, health, discover
        │
        ├── Supabase (RLS on; publishable vs secret key)
        └── R2 (public/ + private/ key prefixes)
```

## Domains

| Domain | Responsibility |
|--------|----------------|
| Public experience | Marketing routes, motion, design system |
| Projects | Portfolio CMS and public pages |
| Media | Assets, visibility, storage abstraction |
| Enquiries | Lead capture and inbox |
| Discovery | Sitemap, robots, llms.txt, JSON-LD, discover API |
| Security | Headers, rate limits, audit, session |
| Auth | Phase 1: static env login; Phase 5: Supabase Auth |
| Config | Zod-parsed env only |

## Server interface hierarchy

1. **Server Components** — public reads, SEO, discovery artifacts
2. **Server Actions** — admin CRUD, enquiry submit (after auth / CSRF)
3. **Route Handlers** — signed uploads, webhooks, health, `/api/v1/discover`

## Extensibility

Keep domain folders under `features/`. Split to `packages/*` only when a second app exists.
