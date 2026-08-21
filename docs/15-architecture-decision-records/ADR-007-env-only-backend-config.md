# ADR-007: Env-Only Backend Configuration

## Context

Backend credentials and feature flags must not live in git or CMS.

## Decision

All backend config via GitHub Environments + Vercel env + local `.env.local`. Zod-validated in `lib/env.ts`. `.env.example` documents names only.

## Alternatives

- Config table in DB for secrets — **rejected**
- Hardcoded values — **rejected**

## Advantages

Auditable secret rotation; environment parity; fail-closed boots.

## Trade-offs

Requires discipline documenting every variable.

## Consequences

Content (copy, projects) in DB; credentials and crawler lists in env.
