# ADR-011 — GSAP licensing for scroll choreography

## Status

Accepted (review on each upgrade)

## Context

Editorial scroll reveals on the public site need a reliable timeline and
ScrollTrigger model. GSAP is the engine assumed by the project's motion skills.

## Decision

Use the GSAP core and ScrollTrigger packages for public-route scroll
choreography, imported dynamically only on routes that use them.

At the time of this ADR, confirm the current Webflow-era GSAP license terms
before any commercial deployment and keep the packages listed in
`package.json` so audits can see the dependency surface.

## Consequences

- Lenis remains the smooth-scroll layer; GSAP owns timelines and ScrollTrigger.
- Reduced motion disables both JS motion layers via `useReducedMotion()`.
- CSP hardening in Phase 6 must be verified against the GSAP bundle.

## Related

- ADR-010 React Three Fiber
- Creative tooling evaluation in the implementation roadmap
