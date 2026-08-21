# SEO and AI Discovery

## Goal

Search engines and AI agents must read **published** public content without executing client JavaScript. This is inbound discoverability — not an outbound scraper.

## Artifacts

| Artifact | Purpose |
|----------|---------|
| Server-rendered HTML | Primary content source |
| `sitemap.ts` | Published canonical URLs |
| `robots.ts` | Per-bot allow/deny; always deny `/admin` |
| `/llms.txt` | Studio + work index for LLM crawlers |
| `/llms-full.txt` | Optional longer summaries |
| JSON-LD | LocalBusiness / CreativeWork / BreadcrumbList |
| Open Graph + canonical | Classic SEO |
| `/api/v1/discover` | Optional published-only JSON API |

## Env policy

```text
DISCOVERY_AI_CRAWLERS_ALLOW=
DISCOVERY_AI_CRAWLERS_DENY=
DISCOVERY_LLMS_FULL_ENABLED=
DISCOVERY_PUBLIC_API_ENABLED=
```

Default: allow major search and AI-search crawlers on public routes; deny admin, drafts, write APIs.

## Content fields

Projects/pages: meta title/description, canonical, OG, robots, `ai_summary`.

Never expose enquiries, unpublished work, or secrets to discovery surfaces.
