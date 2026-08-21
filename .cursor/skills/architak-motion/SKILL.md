# ARCHITAK motion design (project skill)

Use with Lenis, GSAP ScrollTrigger, and optional React Three Fiber.

## Checklist before animating

1. Content exists in server HTML — motion never gates crawlability
2. Honour `useReducedMotion()` for all JS motion
3. Prefer transform/opacity; avoid layout thrash
4. Entrances longer than exits; micro feedback ≤ 200ms
5. Measure LCP/INP before and after; cut the animation if budgets regress
6. Coarse pointers / TV: skip parallax and 3D

## ARCHITAK personality

Architectural editorial — restrained, precise, material. Avoid playful bounce, neon glow, and generic SaaS motion.

## See also

- `docs/21-creative-tooling.md`
- `styles/tokens.css` motion tokens
- ADR-010, ADR-011
