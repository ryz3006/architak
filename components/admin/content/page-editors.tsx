"use client";

import { useState } from "react";

import { AreaRow, LinesRow, TextRow } from "@/components/admin/content/fields";
import { SaveBar, useContentSave } from "@/components/admin/content/save-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import {
  saveContactContentAction,
  saveHomeContentAction,
  saveServicesContentAction,
  saveStudioContentAction,
} from "@/features/content/actions";
import type {
  ContactContentInput,
  HomeContentInput,
  ServicesContentInput,
  StudioContentInput,
} from "@/features/content/schema";

type HeroValue = {
  eyebrow: string;
  headline: string[];
  lead: string[];
  support: string;
  imageAlt: string;
};
type IntroValue = { eyebrow: string; headline: string; support: string };
type ManifestoValue = { eyebrow: string; statement: string; lines: string[]; closing: string };

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

function HeroGroup({ value, onChange }: { value: HeroValue; onChange: (value: HeroValue) => void }) {
  return (
    <>
      <TextRow label="Eyebrow" value={value.eyebrow} onChange={(v) => onChange({ ...value, eyebrow: v })} />
      <LinesRow
        label="Headline"
        hint="Each line is rendered as a separate word/phrase."
        value={value.headline}
        onChange={(v) => onChange({ ...value, headline: v })}
      />
      <LinesRow label="Lead" value={value.lead} onChange={(v) => onChange({ ...value, lead: v })} />
      <AreaRow label="Support" value={value.support} onChange={(v) => onChange({ ...value, support: v })} />
      <TextRow
        label="Image alt text"
        hint="Describes the hero image for accessibility and SEO."
        value={value.imageAlt}
        onChange={(v) => onChange({ ...value, imageAlt: v })}
      />
    </>
  );
}

function IntroGroup({ value, onChange }: { value: IntroValue; onChange: (value: IntroValue) => void }) {
  return (
    <>
      <TextRow label="Eyebrow" value={value.eyebrow} onChange={(v) => onChange({ ...value, eyebrow: v })} />
      <TextRow label="Headline" value={value.headline} onChange={(v) => onChange({ ...value, headline: v })} />
      <AreaRow label="Support" value={value.support} onChange={(v) => onChange({ ...value, support: v })} />
    </>
  );
}

function ManifestoGroup({
  value,
  onChange,
}: {
  value: ManifestoValue;
  onChange: (value: ManifestoValue) => void;
}) {
  return (
    <>
      <TextRow label="Eyebrow" value={value.eyebrow} onChange={(v) => onChange({ ...value, eyebrow: v })} />
      <TextRow
        label="Statement"
        value={value.statement}
        onChange={(v) => onChange({ ...value, statement: v })}
      />
      <LinesRow label="Lines" value={value.lines} onChange={(v) => onChange({ ...value, lines: v })} />
      <TextRow label="Closing" value={value.closing} onChange={(v) => onChange({ ...value, closing: v })} />
    </>
  );
}

/* ---------------- Home ---------------- */

export function HomeEditor({ initial }: { initial: HomeContentInput }) {
  const [state, setState] = useState<HomeContentInput>(initial);
  const { save, pending } = useContentSave(saveHomeContentAction);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Manifesto">
        <AreaRow
          label="Homepage manifesto"
          hint="The large statement below the hero."
          value={state.manifesto}
          onChange={(v) => setState({ ...state, manifesto: v })}
        />
      </SectionCard>

      <SectionCard title="Space story">
        <TextRow
          label="Eyebrow"
          value={state.spaceStory.eyebrow}
          onChange={(v) => setState({ ...state, spaceStory: { ...state.spaceStory, eyebrow: v } })}
        />
        <TextRow
          label="Headline"
          value={state.spaceStory.headline}
          onChange={(v) => setState({ ...state, spaceStory: { ...state.spaceStory, headline: v } })}
        />
        <AreaRow
          label="Support"
          value={state.spaceStory.support}
          onChange={(v) => setState({ ...state, spaceStory: { ...state.spaceStory, support: v } })}
        />
      </SectionCard>

      <SectionCard title="Hero chapters">
        <p className="text-fluid-sm text-muted">
          The rotating hero statements. Images and motion stay managed in code.
        </p>
        {state.heroChapters.map((chapter, index) => (
          <div key={chapter.id} className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
            <p className="mb-3 text-fluid-xs font-medium uppercase tracking-wide text-muted">
              Chapter {chapter.index || index + 1}
            </p>
            <div className="flex flex-col gap-4">
              <TextRow
                label="Label"
                value={chapter.label}
                onChange={(v) => {
                  const next = [...state.heroChapters];
                  next[index] = { ...chapter, label: v };
                  setState({ ...state, heroChapters: next });
                }}
              />
              <TextRow
                label="Headline"
                value={chapter.headline}
                onChange={(v) => {
                  const next = [...state.heroChapters];
                  next[index] = { ...chapter, headline: v };
                  setState({ ...state, heroChapters: next });
                }}
              />
              <TextRow
                label="Headline line 2"
                value={chapter.headlineLine2}
                onChange={(v) => {
                  const next = [...state.heroChapters];
                  next[index] = { ...chapter, headlineLine2: v };
                  setState({ ...state, heroChapters: next });
                }}
              />
              <AreaRow
                label="Support"
                value={chapter.support}
                onChange={(v) => {
                  const next = [...state.heroChapters];
                  next[index] = { ...chapter, support: v };
                  setState({ ...state, heroChapters: next });
                }}
              />
            </div>
          </div>
        ))}
      </SectionCard>

      <SaveBar onSave={() => save(state)} pending={pending} note="Changes publish to the homepage." />
    </div>
  );
}

/* ---------------- Studio ---------------- */

export function StudioEditor({ initial }: { initial: StudioContentInput }) {
  const [state, setState] = useState<StudioContentInput>(initial);
  const { save, pending } = useContentSave(saveStudioContentAction);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Hero">
        <HeroGroup value={state.hero} onChange={(hero) => setState({ ...state, hero })} />
      </SectionCard>
      <SectionCard title="Manifesto">
        <ManifestoGroup
          value={state.manifesto}
          onChange={(manifesto) => setState({ ...state, manifesto })}
        />
      </SectionCard>
      <SectionCard title="Work intro">
        <IntroGroup value={state.work} onChange={(work) => setState({ ...state, work })} />
      </SectionCard>
      <SectionCard title="Featured works">
        <IntroGroup
          value={state.featuredWorks}
          onChange={(featuredWorks) => setState({ ...state, featuredWorks })}
        />
      </SectionCard>
      <SectionCard title="Voices intro">
        <IntroGroup value={state.voices} onChange={(voices) => setState({ ...state, voices })} />
      </SectionCard>
      <SectionCard title="Compliment">
        <TextRow
          label="Headline"
          value={state.compliment.headline}
          onChange={(v) => setState({ ...state, compliment: { ...state.compliment, headline: v } })}
        />
        <AreaRow
          label="Support"
          value={state.compliment.support}
          onChange={(v) => setState({ ...state, compliment: { ...state.compliment, support: v } })}
        />
      </SectionCard>
      <SectionCard title="Call to action">
        <IntroGroup value={state.cta} onChange={(cta) => setState({ ...state, cta })} />
      </SectionCard>

      <SaveBar onSave={() => save(state)} pending={pending} note="Changes publish to the Studio page." />
    </div>
  );
}

/* ---------------- Services ---------------- */

export function ServicesEditor({ initial }: { initial: ServicesContentInput }) {
  const [state, setState] = useState<ServicesContentInput>(initial);
  const { save, pending } = useContentSave(saveServicesContentAction);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Hero">
        <HeroGroup value={state.hero} onChange={(hero) => setState({ ...state, hero })} />
      </SectionCard>
      <SectionCard title="Manifesto">
        <ManifestoGroup
          value={state.manifesto}
          onChange={(manifesto) => setState({ ...state, manifesto })}
        />
      </SectionCard>
      <SectionCard title="Disciplines intro">
        <IntroGroup
          value={state.disciplines}
          onChange={(disciplines) => setState({ ...state, disciplines })}
        />
      </SectionCard>
      <SectionCard title="Compliment">
        <TextRow
          label="Headline"
          value={state.compliment.headline}
          onChange={(v) => setState({ ...state, compliment: { ...state.compliment, headline: v } })}
        />
        <AreaRow
          label="Support"
          value={state.compliment.support}
          onChange={(v) => setState({ ...state, compliment: { ...state.compliment, support: v } })}
        />
      </SectionCard>
      <SectionCard title="Call to action">
        <IntroGroup value={state.cta} onChange={(cta) => setState({ ...state, cta })} />
      </SectionCard>

      <SaveBar onSave={() => save(state)} pending={pending} note="Changes publish to the Services page." />
    </div>
  );
}

/* ---------------- Contact ---------------- */

export function ContactEditor({ initial }: { initial: ContactContentInput }) {
  const [state, setState] = useState<ContactContentInput>(initial);
  const { save, pending } = useContentSave(saveContactContentAction);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Hero">
        <HeroGroup value={state.hero} onChange={(hero) => setState({ ...state, hero })} />
      </SectionCard>
      <SectionCard title="Bridge">
        <LinesRow
          label="Bridge lines"
          value={state.bridge.lines}
          onChange={(lines) => setState({ ...state, bridge: { lines } })}
        />
      </SectionCard>
      <SectionCard title="Channels intro">
        <IntroGroup value={state.channels} onChange={(channels) => setState({ ...state, channels })} />
      </SectionCard>
      <SectionCard title="Form intro">
        <IntroGroup value={state.form} onChange={(form) => setState({ ...state, form })} />
      </SectionCard>
      <SectionCard title="Social intro">
        <IntroGroup value={state.social} onChange={(social) => setState({ ...state, social })} />
      </SectionCard>

      <SaveBar onSave={() => save(state)} pending={pending} note="Changes publish to the Contact page." />
    </div>
  );
}
