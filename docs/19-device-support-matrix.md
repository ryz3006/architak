# Device support matrix

Automated coverage lives in `e2e/adaptive.spec.ts`. Manual release sign-off:

| Device class | Example | Checks |
|--------------|---------|--------|
| Compact phone | 320–360 CSS px Android | Nav reachable, no overflow, CTA in view |
| Large phone | iPhone / Pixel | Safe-area, landscape short height |
| Foldable | Fold outer + inner | No seam-critical CTA |
| Tablet | iPad / Android tablet | Gallery columns, admin stacked lists |
| Laptop | Windows 125%/150% scale, MacBook | Zoom, forced-colors |
| Desktop / ultrawide | 1920–2560 | Measure cap, bleed imagery |
| TV / projector | 3840, projected | Focus ring, contrast, overscan |

## Release gate

1. Playwright adaptive + a11y suites green in CI
2. Manual pass on one phone, one tablet, one laptop, one large display
3. `prefers-reduced-motion` and `prefers-contrast: more` spot-checked
