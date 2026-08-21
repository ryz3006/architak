# ADR-001: Next.js App Router

## Context

Greenfield ARCHITAK platform needs SSR/SSG, SEO, and a modern React model.

## Decision

Use **Next.js App Router** with TypeScript, Server Components by default, Client Components only where interaction requires them.

## Alternatives

- Pages Router — older model, weaker RSC story
- Remix / Astro — viable but weaker alignment with Vercel + React ecosystem for this team

## Advantages

Route-level code splitting, metadata API, Server Actions, Vercel-native deploys.

## Trade-offs

App Router complexity; careful client boundary discipline required.

## Consequences

Public pages stay crawlable without client JS. Heavy libs (GSAP, Three) must be dynamically imported.
