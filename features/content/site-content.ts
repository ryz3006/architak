import "server-only";

import { cache } from "react";

import * as staticSite from "@/content/static";
import type {
  ContactPageContent,
  FeaturedWorkVideo,
  HeroChapter,
  ServicesPageContent,
  SocialProfiles,
  SpaceStory,
  StaticService,
  StudioPageContent,
  Testimonial,
} from "@/content/static";
import {
  deepMerge,
  getPublicPageOverride,
  getSettingValue,
  type JsonObject,
} from "@/features/content/store";

/**
 * CMS-first content resolution. Each getter reads the CMS override (empty by
 * default) and deep-merges it over the bundled static content, so the public
 * site always renders and edits appear the moment they are published.
 *
 * Cached per-request so a page that reads several sections issues one query
 * per source rather than one per getter.
 */
const pageOverride = cache((slug: Parameters<typeof getPublicPageOverride>[0]) =>
  getPublicPageOverride(slug),
);
const setting = cache((key: string) => getSettingValue(key));

function asObject(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

/* ---------------- Global content settings keys ---------------- */
export const CONTENT_KEYS = {
  socials: "content.socials",
  studioInfo: "content.studioInfo",
  testimonials: "content.testimonials",
  videos: "content.videos",
  services: "content.services",
} as const;

/* ---------------- Home ---------------- */

export async function getManifesto(): Promise<string> {
  const override = await pageOverride("home");
  return typeof override.manifesto === "string" && override.manifesto.trim()
    ? (override.manifesto as string)
    : staticSite.getManifesto();
}

export async function getSpaceStory(): Promise<SpaceStory> {
  const override = await pageOverride("home");
  return deepMerge(staticSite.getSpaceStory(), asObject(override.spaceStory) ?? undefined);
}

export async function getHeroChapters(): Promise<HeroChapter[]> {
  const override = await pageOverride("home");
  return Array.isArray(override.heroChapters) && override.heroChapters.length > 0
    ? (override.heroChapters as HeroChapter[])
    : staticSite.getHeroChapters();
}

/* ---------------- Studio / Services / Contact page copy ---------------- */

export async function getStudioPageContent(): Promise<StudioPageContent> {
  const override = await pageOverride("studio");
  return deepMerge(staticSite.getStudioPageContent(), override);
}

export async function getServicesPageContent(): Promise<ServicesPageContent> {
  const override = await pageOverride("services");
  return deepMerge(staticSite.getServicesPageContent(), override);
}

export async function getContactPageContent(): Promise<ContactPageContent> {
  const override = await pageOverride("contact");
  return deepMerge(staticSite.getContactPageContent(), override);
}

/* ---------------- Global lists ---------------- */

export async function getServices(): Promise<StaticService[]> {
  const value = await setting(CONTENT_KEYS.services);
  return Array.isArray(value) && value.length > 0
    ? (value as StaticService[])
    : staticSite.getStaticServices();
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const value = await setting(CONTENT_KEYS.testimonials);
  return Array.isArray(value) && value.length > 0
    ? (value as Testimonial[])
    : staticSite.getTestimonials();
}

export async function getFeaturedWorkVideos(): Promise<FeaturedWorkVideo[]> {
  const value = await setting(CONTENT_KEYS.videos);
  return Array.isArray(value) && value.length > 0
    ? (value as FeaturedWorkVideo[])
    : staticSite.getFeaturedWorkVideos();
}

export async function getSocialProfiles(): Promise<SocialProfiles> {
  const value = await setting(CONTENT_KEYS.socials);
  return deepMerge(staticSite.getSocialProfiles(), asObject(value) ?? undefined);
}

export type StudioInfo = ReturnType<typeof staticSite.getStaticSite>["studio"];

export async function getStudioInfo(): Promise<StudioInfo> {
  const value = await setting(CONTENT_KEYS.studioInfo);
  return deepMerge(staticSite.getStaticSite().studio, asObject(value) ?? undefined);
}
