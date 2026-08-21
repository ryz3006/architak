# ADR-010 — React Three Fiber over Threlte

## Status

Accepted

## Context

ARCHITAK needs an optional 3D fragment on the public site. Candidates included
[Threlte](https://github.com/threlte/threlte) and React Three Fiber.

## Decision

Reject Threlte. Adopt `@react-three/fiber` (and selective `@react-three/drei`
helpers) behind `FEATURE_THREE_D`, default off.

## Consequences

- Threlte is a Svelte library and cannot render inside the React/Next tree
  without shipping a second framework runtime or rewriting the public site.
- R3F matches the existing React 19 + Next.js App Router stack and is the path
  genjutsu's `threejs-r3f` skill assumes.
- The 3D scene must be dynamically imported with `ssr: false`, never sit on the
  critical path, and fall back to a static image under reduced motion or failed
  WebGL.

## Related

- ADR-004 modular monolith
- `docs/11-motion-and-interaction-system.md`
