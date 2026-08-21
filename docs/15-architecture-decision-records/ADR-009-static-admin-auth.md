# ADR-009: Static Admin Credentials then Supabase Auth

## Context

Need a secure interim gate for a single operator before multi-user Auth.

## Decision

Phases 1–4: env `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` with signed HTTP-only cookie and middleware. Phase 5+: replace with Supabase Auth + `profiles` + roles when multiple staff users are required.

## Alternatives

- Supabase Auth from day one — more setup before CMS exists
- HTTP Basic Auth only — weaker UX and harder CSRF story

## Advantages

Simple, env-managed, no user table yet.

## Trade-offs

Not multi-user; secret key used for DB writes after session check.

## Consequences

Document migration path in `06-authentication-and-rbac.md`. Never put password in client code.
