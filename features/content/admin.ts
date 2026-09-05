import "server-only";

import * as staticSite from "@/content/static";
import { requireAdminSession } from "@/features/auth/session";
import {
  deepMerge,
  getAdminPageOverride,
  getAdminSettingValue,
  type JsonObject,
} from "@/features/content/store";
import { CONTENT_KEYS } from "@/features/content/site-content";
import type {
  ContactContentInput,
  HomeContentInput,
  ServiceInput,
  ServicesContentInput,
  SocialsInput,
  StudioContentInput,
  StudioInfoInput,
  TestimonialInput,
  VideoInput,
} from "@/features/content/schema";

function asObject(value: unknown): JsonObject | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined;
}

/* ---------------- Page editors ---------------- */

export async function getHomeContentInput(): Promise<HomeContentInput> {
  const override = await getAdminPageOverride("home");
  const spaceStory = deepMerge(staticSite.getSpaceStory(), asObject(override.spaceStory));
  const heroChapters =
    Array.isArray(override.heroChapters) && override.heroChapters.length > 0
      ? (override.heroChapters as HomeContentInput["heroChapters"])
      : staticSite.getHeroChapters().map((c) => ({
          id: c.id,
          index: c.index,
          label: c.label,
          headline: c.headline,
          headlineLine2: c.headlineLine2,
          support: c.support,
        }));
  return {
    manifesto: typeof override.manifesto === "string" ? override.manifesto : staticSite.getManifesto(),
    spaceStory: {
      eyebrow: spaceStory.eyebrow,
      headline: spaceStory.headline,
      support: spaceStory.support,
    },
    heroChapters,
  };
}

export async function getStudioContentInput(): Promise<StudioContentInput> {
  const merged = deepMerge(staticSite.getStudioPageContent(), await getAdminPageOverride("studio"));
  return {
    hero: {
      eyebrow: merged.hero.eyebrow,
      headline: merged.hero.headline,
      lead: merged.hero.lead,
      support: merged.hero.support,
      imageAlt: merged.hero.imageAlt,
    },
    manifesto: {
      eyebrow: merged.manifesto.eyebrow,
      statement: merged.manifesto.statement,
      lines: merged.manifesto.lines,
      closing: merged.manifesto.closing,
    },
    work: merged.work,
    featuredWorks: merged.featuredWorks,
    voices: merged.voices,
    compliment: merged.compliment,
    cta: merged.cta,
  };
}

export async function getServicesContentInput(): Promise<ServicesContentInput> {
  const merged = deepMerge(
    staticSite.getServicesPageContent(),
    await getAdminPageOverride("services"),
  );
  return {
    hero: {
      eyebrow: merged.hero.eyebrow,
      headline: merged.hero.headline,
      lead: merged.hero.lead,
      support: merged.hero.support,
      imageAlt: merged.hero.imageAlt,
    },
    manifesto: {
      eyebrow: merged.manifesto.eyebrow,
      statement: merged.manifesto.statement,
      lines: merged.manifesto.lines,
      closing: merged.manifesto.closing,
    },
    disciplines: merged.disciplines,
    compliment: merged.compliment,
    cta: merged.cta,
  };
}

export async function getContactContentInput(): Promise<ContactContentInput> {
  const merged = deepMerge(
    staticSite.getContactPageContent(),
    await getAdminPageOverride("contact"),
  );
  return {
    hero: {
      eyebrow: merged.hero.eyebrow,
      headline: merged.hero.headline,
      lead: merged.hero.lead,
      support: merged.hero.support,
      imageAlt: merged.hero.imageAlt,
    },
    bridge: { lines: merged.bridge.lines },
    channels: merged.channels,
    form: merged.form,
    social: merged.social,
  };
}

/* ---------------- Global lists / settings ---------------- */

export async function getSocialsInput(): Promise<SocialsInput> {
  await requireAdminSession();
  const value = asObject(await getAdminSettingValue(CONTENT_KEYS.socials));
  return deepMerge(staticSite.getSocialProfiles(), value);
}

export async function getStudioInfoInput(): Promise<StudioInfoInput> {
  await requireAdminSession();
  const value = asObject(await getAdminSettingValue(CONTENT_KEYS.studioInfo));
  const studio = deepMerge(staticSite.getStaticSite().studio, value);
  return {
    name: studio.name,
    tagline: studio.tagline,
    statement: studio.statement,
    location: studio.location,
    address: studio.address,
    phone: studio.phone,
    email: studio.email,
  };
}

export async function getTestimonialsInput(): Promise<TestimonialInput[]> {
  await requireAdminSession();
  const value = await getAdminSettingValue(CONTENT_KEYS.testimonials);
  const source =
    Array.isArray(value) && value.length > 0
      ? (value as TestimonialInput[])
      : staticSite.getTestimonials();
  return source.map((t) => ({
    quote: t.quote,
    name: t.name,
    role: t.role ?? "",
    location: t.location ?? "",
    image: t.image ?? "",
  }));
}

export async function getVideosInput(): Promise<VideoInput[]> {
  await requireAdminSession();
  const value = await getAdminSettingValue(CONTENT_KEYS.videos);
  const source =
    Array.isArray(value) && value.length > 0
      ? (value as VideoInput[])
      : staticSite.getFeaturedWorkVideos();
  return source.map((v) => ({
    id: v.id,
    title: v.title,
    category: v.category ?? "",
    location: v.location ?? "",
    summary: v.summary ?? "",
    poster: v.poster ?? "",
    video: {
      objectPath: v.video?.objectPath ?? "",
      localPath: v.video?.localPath ?? "",
      mimeType: v.video?.mimeType ?? "",
    },
  }));
}

export async function getServicesListInput(): Promise<ServiceInput[]> {
  await requireAdminSession();
  const value = await getAdminSettingValue(CONTENT_KEYS.services);
  const source =
    Array.isArray(value) && value.length > 0
      ? (value as ServiceInput[])
      : staticSite.getStaticServices();
  return source.map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.description ?? "",
    detail: s.detail ?? "",
    image: s.image ?? "",
  }));
}
