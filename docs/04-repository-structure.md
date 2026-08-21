# Repository Structure

Single Next.js app at repository root (no `apps/web` until a second deployable exists).

```text
architak/
├── app/
│   ├── (public)/             # marketing experience
│   ├── (admin)/admin/        # authenticated CMS
│   ├── api/                  # webhooks, signed uploads, health, discover
│   ├── sitemap.ts
│   ├── robots.ts
│   └── llms.txt/route.ts     # Phase 3
├── features/
│   ├── projects/
│   ├── media/
│   ├── enquiries/
│   ├── discovery/
│   ├── security/
│   ├── studio/
│   └── auth/                 # Phase 1: static session; Phase 5: Supabase Auth
├── components/
│   ├── ui/
│   ├── layout/
│   └── motion/
├── lib/
│   ├── env.ts
│   ├── supabase/
│   ├── storage/
│   └── security/
├── styles/
├── supabase/                 # migrations when CMS tables land
├── docs/
├── public/brand/
├── .github/
├── .env.example
└── tooling/                  # optional eslint/prettier fragments
```

## Rules

- Domain-specific UI lives under `features/<domain>/`
- Shared primitives under `components/ui`
- Secrets never in repo; see `docs/16-environment-and-configuration.md`
