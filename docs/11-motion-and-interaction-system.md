# Motion and Interaction System

## Categories

| Level | Use |
|-------|-----|
| micro | hover, focus, buttons |
| small | menu, tabs |
| medium | section reveals |
| large | page transitions |
| cinematic | scroll-linked storytelling (Phase 4) |

## Libraries

- CSS transitions when sufficient
- Framer Motion for component interactions
- GSAP + ScrollTrigger + Lenis in Phase 4, route-level dynamic import
- Three.js / R3F only Phase 4+, never global

## Rules

- Respect `prefers-reduced-motion`
- Motion must not block content access
- Do not animate everything
- Crawlers receive non-WebGL HTML fallback
