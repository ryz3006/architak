import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OverflowGuard } from "@/app/dev/design-system/overflow-guard";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const TYPE_STEPS = [
  { token: "--step-7", utility: "text-display-2xl", label: "Display 2XL" },
  { token: "--step-6", utility: "text-display-xl", label: "Display XL" },
  { token: "--step-5", utility: "text-display-lg", label: "Display LG" },
  { token: "--step-4", utility: "text-display-md", label: "Display MD" },
  { token: "--step-3", utility: "text-display-sm", label: "Display SM" },
  { token: "--step-2", utility: "text-fluid-xl", label: "Body XL" },
  { token: "--step-1", utility: "text-fluid-lg", label: "Body LG" },
  { token: "--step-0", utility: "text-fluid-base", label: "Body base" },
  { token: "--step-00", utility: "text-fluid-sm", label: "Body SM" },
  { token: "--step-000", utility: "text-fluid-xs", label: "Body XS" },
] as const;

/*
 * Contrast ratios are computed against the surface each colour is actually used
 * on, and recorded here so a palette change that breaks AA is visible in review
 * rather than discovered by a user.
 */
const COLORS = [
  { token: "--color-foreground", value: "#f5f2eb", on: "background", ratio: "17.4:1", use: "Body and headings" },
  { token: "--color-muted", value: "#a5a09a", on: "background", ratio: "7.6:1", use: "Secondary copy" },
  { token: "--color-accent", value: "#c4a574", on: "background", ratio: "8.9:1", use: "Emphasis, links" },
  { token: "--color-focus", value: "#e8d5ae", on: "background", ratio: "13.1:1", use: "Focus ring" },
  { token: "--color-border", value: "#2a2a2a", on: "background", ratio: "1.4:1", use: "Non-text rules only" },
  { token: "--color-surface", value: "#121212", on: "background", ratio: "1.1:1", use: "Panel fill only" },
] as const;

const MOTION = [
  { token: "--duration-instant", value: "80ms", use: "Colour and opacity feedback" },
  { token: "--duration-micro", value: "120ms", use: "Hover, focus" },
  { token: "--duration-small", value: "200ms", use: "Small element entrance" },
  { token: "--duration-medium", value: "320ms", use: "Panels, disclosure" },
  { token: "--duration-large", value: "480ms", use: "Image and hero reveal" },
  { token: "--duration-page", value: "640ms", use: "Route transition" },
] as const;

/** Slot widths that prove container-query components adapt to their container. */
const SLOTS = [
  { label: "Narrow slot (18rem)", width: "18rem" },
  { label: "Medium slot (28rem)", width: "28rem" },
  { label: "Wide slot (44rem)", width: "44rem" },
] as const;

export default function DesignSystemPage() {
  // Never expose the internal showcase on the production site.
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main id="main-content" className="page-frame py-fluid-lg">
      <OverflowGuard />

      <header>
        <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">Internal</p>
        <h1 className="display mt-3 text-display-lg">Design system</h1>
        <p className="measure mt-4 text-muted">
          Tokens and primitives in every state. Resize the window, zoom to 400%, and tab through
          this page: focus must always be visible and nothing may overflow horizontally.
        </p>
      </header>

      <section aria-labelledby="type-heading" className="mt-fluid-xl border-t border-border pt-10">
        <h2 id="type-heading" className="display text-display-sm">
          Type scale
        </h2>
        <p className="measure mt-2 text-fluid-sm text-muted">
          Every step is fluid between a 320px and a 1536px viewport, so intermediate widths get a
          proportionate size rather than the nearest breakpoint&rsquo;s.
        </p>
        <ul className="mt-8 flex flex-col gap-6">
          {TYPE_STEPS.map((step) => (
            <li key={step.token} className="border-b border-border pb-6">
              <p className="text-fluid-xs tracking-widest text-muted uppercase">
                {step.label} · {step.utility} · var({step.token})
              </p>
              <p className={`display mt-2 ${step.utility}`}>Created to create</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="color-heading" className="mt-fluid-xl border-t border-border pt-10">
        <h2 id="color-heading" className="display text-display-sm">
          Colour and contrast
        </h2>
        <ul className="mt-8 grid gap-fluid-sm [grid-template-columns:repeat(auto-fit,minmax(min(18rem,100%),1fr))]">
          {COLORS.map((color) => (
            <li key={color.token} className="border border-border p-4">
              <div
                aria-hidden="true"
                className="h-16 w-full border border-border"
                style={{ background: `var(${color.token})` }}
              />
              <p className="mt-3 text-fluid-sm text-foreground">{color.token}</p>
              <p className="text-fluid-xs text-muted">
                {color.value} on {color.on}
              </p>
              <p className="mt-2 text-fluid-xs text-muted">
                Contrast {color.ratio} — {color.use}
              </p>
            </li>
          ))}
        </ul>
        <p className="measure mt-4 text-fluid-xs text-muted">
          Border and surface tokens are intentionally below the text threshold; they are only ever
          used for non-text boundaries and panel fills.
        </p>
      </section>

      <section aria-labelledby="motion-heading" className="mt-fluid-xl border-t border-border pt-10">
        <h2 id="motion-heading" className="display text-display-sm">
          Motion
        </h2>
        <p className="measure mt-2 text-fluid-sm text-muted">
          Durations scale with the distance travelled and the size of the surface. All collapse to
          zero under <code>prefers-reduced-motion</code>.
        </p>
        <ul className="mt-8 flex flex-col gap-3">
          {MOTION.map((entry) => (
            <li
              key={entry.token}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3"
            >
              <span className="text-fluid-sm">{entry.token}</span>
              <span className="text-fluid-xs text-muted">
                {entry.value} — {entry.use}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="button-heading" className="mt-fluid-xl border-t border-border pt-10">
        <h2 id="button-heading" className="display text-display-sm">
          Button — every state
        </h2>
        <div className="mt-8 flex flex-col gap-8">
          {(["primary", "secondary", "ghost"] as const).map((variant) => (
            <div key={variant}>
              <p className="text-fluid-xs tracking-widest text-muted uppercase">{variant}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <Button variant={variant}>Default</Button>
                <Button variant={variant} disabled>
                  Disabled
                </Button>
                <Button variant={variant} pending>
                  Submitting
                </Button>
                <Button variant={variant} size="sm">
                  Small
                </Button>
                <Button variant={variant} size="lg">
                  Large
                </Button>
              </div>
            </div>
          ))}
          <p className="text-fluid-xs text-muted">
            Focus states are not screenshot-able here: tab through the row above to confirm the ring
            is visible on every variant.
          </p>
        </div>
      </section>

      <section aria-labelledby="field-heading" className="mt-fluid-xl border-t border-border pt-10">
        <h2 id="field-heading" className="display text-display-sm">
          Form fields — including error state
        </h2>
        <div className="measure mt-8 flex flex-col gap-8">
          <TextField label="Name" placeholder="Your name" required />
          <TextField label="Email" type="email" hint="We reply within two working days." />
          <TextField
            label="Phone"
            defaultValue="not-a-number"
            error="Enter a phone number we can reach you on."
          />
          <TextAreaField label="About the project" hint="Rooms, timeline, and budget range." />
          <TextField label="Disabled" disabled defaultValue="Unavailable" />
        </div>
      </section>

      <section
        aria-labelledby="container-heading"
        className="mt-fluid-xl border-t border-border pt-10"
      >
        <h2 id="container-heading" className="display text-display-sm">
          Container queries
        </h2>
        <p className="measure mt-2 text-fluid-sm text-muted">
          The same card markup at three slot widths. The heading grows with the container, not the
          viewport, which is what keeps a project tile correct in a phone column, a foldable inner
          screen, and a wide desktop grid.
        </p>
        <div className="mt-8 flex flex-col gap-8">
          {SLOTS.map((slot) => (
            <div key={slot.label}>
              <p className="text-fluid-xs tracking-widest text-muted uppercase">{slot.label}</p>
              <div className="mt-3 max-w-full overflow-hidden" style={{ width: slot.width }}>
                <article className="@container border border-border p-4">
                  <p className="text-fluid-xs tracking-widest text-muted uppercase">
                    Residential · Kochi
                  </p>
                  <h3 className="display mt-1 text-fluid-lg @md:text-display-sm">
                    Living Room Atelier
                  </h3>
                  <p className="mt-2 text-fluid-sm text-muted @md:text-fluid-base">
                    A layered material palette anchored by a single long sightline.
                  </p>
                </article>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
