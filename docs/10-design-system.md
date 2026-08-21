# Design System

## Direction

Premium architectural editorial. Logo-driven: near-black, paper/off-white, thin rules, triangle geometry. **Not** default shadcn/dashboard chrome on public pages.

## Tokens (CSS variables)

Defined in `styles/tokens.css`:

- Color: background, foreground, muted, border, accent (warm stone)
- Typography: display + body scales, line-heights
- Spacing: semantic scale (avoid arbitrary `p-[13px]`)
- Radius, elevation, motion durations/easings, z-index layers

## Typography

- Display: expressive headings for editorial moments
- Sans: UI and body readability
- Hierarchy via scale, whitespace, weight, composition — not weight alone

## Components

- `components/ui` — accessible primitives (shadcn/Radix where needed), restyled
- Public compositions avoid repetitive card grids and glassmorphism

## Phase 2

`/dev/design-system` (noindex) for token and primitive showcase.
