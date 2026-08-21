# ADR-004: Modular Monolith

## Context

Platform spans public site, CMS, media, leads, SEO, future operations.

## Decision

**Single Next.js app** with domain folders under `features/`. No Turborepo until a second app needs shared packages.

## Alternatives

- Microservices — premature cost
- Turborepo now — tooling without benefit

## Advantages

Simple deploy, clear domain boundaries, low initial cost.

## Trade-offs

Must keep boundaries disciplined so a later package split is mechanical.

## Consequences

One Vercel project. Strong folder conventions over service meshes.
