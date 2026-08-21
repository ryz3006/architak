# Technology Decisions

Summary of stack choices. Full rationale in ADRs under `docs/15-architecture-decision-records/`.

| Decision | Choice | ADR |
|----------|--------|-----|
| App framework | Next.js App Router, TypeScript, React Server Components | ADR-001 |
| Database / auth platform | Supabase Postgres (`architak-media`), RLS on by default | ADR-002 |
| Object storage | Cloudflare R2 bucket `architak-media`, private, `public/`/`private/` prefixes | ADR-003 |
| Architecture style | Modular monolith, single app | ADR-004 |
| Media processing | Deferred; `next/image` for public assets first | ADR-005 |
| SEO + AI discovery | Server HTML, sitemap, robots, llms.txt, optional discover API | ADR-006 |
| Configuration | GitHub Environments + Vercel env; Zod `lib/env.ts` | ADR-007 |
| Security baseline | Headers, CSP starter, fail-closed env, rate limits | ADR-008 |
| Admin auth (interim) | Static `ADMIN_USERNAME` / `ADMIN_PASSWORD` + signed cookie | ADR-009 |
| Styling | Tailwind + CSS variables; shadcn primitives for admin/a11y only | — |
| Validation | Zod (UI + server) | — |
| Package manager | pnpm | — |
| ORM | None in Phase 1; Supabase JS + generated types | — |

## Explicit non-choices (for now)

- Turborepo / monorepo packages
- Drizzle / Prisma
- Supabase Auth for admin (until Phase 5)
- Public R2 bucket ACL
- Global GSAP / Three.js
