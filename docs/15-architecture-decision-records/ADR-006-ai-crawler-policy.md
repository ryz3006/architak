# ADR-006: AI Crawler and SEO Discovery Policy

## Context

Need discoverability for Google and AI search agents without exposing admin or PII.

## Decision

Server-rendered public HTML; `sitemap.ts`; env-driven `robots.ts`; `/llms.txt`; optional `/api/v1/discover` (published-only, rate-limited). Deny `/admin` always.

## Alternatives

- Client-only SPA — bad for crawlers
- Block all AI bots — optional via `DISCOVERY_AI_CRAWLERS_DENY`

## Advantages

Citation-friendly public content; policy changeable without code.

## Trade-offs

Must keep `ai_summary` and published flags accurate.

## Consequences

Never put enquiries or private media into discovery artifacts.
