# ADR-008: Security Baseline

## Context

Security is a first-class platform pillar.

## Decision

Phase 1 ships: fail-closed env, security headers (CSP starter, HSTS in production, nosniff, referrer-policy, permissions-policy), admin noindex + robots deny, Dependabot, secret scanning expectations. RLS never disabled. R2 never blindly public.

## Alternatives

- Defer headers to Phase 6 — **rejected**
- Trust UI-only auth — **rejected**

## Advantages

Attack surface reduced before content launch.

## Trade-offs

CSP may need iterative tightening as third parties are added.

## Consequences

`lib/security/headers.ts` applied globally; login rate-limited.
