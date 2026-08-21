# ADR-005: Media Processing Strategy

## Context

Need optimized images without building a processing pipeline on day one.

## Decision

Phase 3: `next/image` for **public** assets only. Phase 5: evaluate Cloudflare Images or on-upload Sharp variants. Private assets always use signed URLs — never `next/image` against private keys without auth.

## Alternatives

- Full image pipeline at Phase 1 — premature
- Self-hosted video — rejected; use YouTube embeds

## Advantages

Fast path to production quality; defer cost.

## Trade-offs

Limited variants until Phase 5.

## Consequences

Document variant strategy when CMS uploads land.
