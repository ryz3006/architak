# Creative tooling notes

## Agent skills (zero runtime cost)

| Skill | Role | Install / vendor |
|-------|------|------------------|
| [LottieFiles motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | Timing, easing, choreography principles for Cursor | `npx skills add LottieFiles/motion-design-skill` |
| [genjutsu](https://github.com/AThevon/genjutsu) web modules | GSAP / CSS-native / R3F guidance | Vendor MIT modules into `.cursor/skills/` when needed; use `cast`, never `paint` |

Record the genjutsu upstream commit when vendoring. Skip `ui-ux-pro-max`.

## Runtime libraries

| Library | Role | Gate |
|---------|------|------|
| Lenis | Smooth scroll island | Off when reduced motion |
| GSAP + ScrollTrigger | Editorial reveals | Dynamic import per route |
| React Three Fiber | Optional 3D | `FEATURE_THREE_D=false` by default |

Threlte is rejected — see ADR-010.
