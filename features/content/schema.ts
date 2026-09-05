import { z } from "zod";

/** URL that may also be an empty string (cleared field). */
const urlOrEmpty = z.union([z.string().url(), z.literal("")]);

const text = (max = 500) => z.string().trim().max(max);
const requiredText = (max = 500) => z.string().trim().min(1).max(max);
const lines = (max = 300) => z.array(z.string().trim().max(max)).max(20);

/* ---------------- Global lists (site_settings) ---------------- */

export const socialsSchema = z.object({
  linkedin: urlOrEmpty,
  youtube: urlOrEmpty,
  instagram: urlOrEmpty,
  facebook: urlOrEmpty,
});
export type SocialsInput = z.infer<typeof socialsSchema>;

export const studioInfoSchema = z.object({
  name: requiredText(120),
  tagline: text(160),
  statement: text(600),
  location: text(200),
  address: text(300),
  phone: text(60),
  email: z.union([z.string().email(), z.literal("")]),
});
export type StudioInfoInput = z.infer<typeof studioInfoSchema>;

export const testimonialSchema = z.object({
  quote: requiredText(2000),
  name: requiredText(120),
  role: text(120),
  location: text(120),
  image: text(400),
});
export const testimonialsSchema = z.array(testimonialSchema).max(50);
export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const videoSchema = z.object({
  id: requiredText(80),
  title: requiredText(160),
  category: text(120),
  location: text(120),
  summary: text(600),
  poster: text(400),
  video: z.object({
    objectPath: text(400),
    localPath: text(400),
    mimeType: text(80),
  }),
});
export const videosSchema = z.array(videoSchema).max(50);
export type VideoInput = z.infer<typeof videoSchema>;

export const serviceSchema = z.object({
  slug: requiredText(80),
  title: requiredText(160),
  description: text(400),
  detail: text(1200),
  image: text(400),
});
export const servicesSchema = z.array(serviceSchema).max(30);
export type ServiceInput = z.infer<typeof serviceSchema>;

/* ---------------- Page copy (pages.content) ---------------- */

const heroSchema = z.object({
  eyebrow: text(160),
  headline: lines(160),
  lead: lines(240),
  support: text(600),
  imageAlt: text(240),
});

const sectionIntroSchema = z.object({
  eyebrow: text(160),
  headline: text(240),
  support: text(600),
});

const manifestoSchema = z.object({
  eyebrow: text(160),
  statement: text(400),
  lines: lines(300),
  closing: text(300),
});

const ctaSchema = z.object({
  eyebrow: text(160),
  headline: text(300),
  support: text(600),
});

const heroChapterSchema = z.object({
  id: requiredText(80),
  index: text(8),
  label: text(80),
  headline: text(200),
  headlineLine2: text(200),
  support: text(400),
});

export const homeContentSchema = z.object({
  manifesto: text(600),
  spaceStory: z.object({
    eyebrow: text(160),
    headline: text(300),
    support: text(400),
  }),
  heroChapters: z.array(heroChapterSchema).max(12),
});
export type HomeContentInput = z.infer<typeof homeContentSchema>;

export const studioContentSchema = z.object({
  hero: heroSchema,
  manifesto: manifestoSchema,
  work: sectionIntroSchema,
  featuredWorks: sectionIntroSchema,
  voices: sectionIntroSchema,
  compliment: z.object({ headline: text(300), support: text(600) }),
  cta: ctaSchema,
});
export type StudioContentInput = z.infer<typeof studioContentSchema>;

export const servicesContentSchema = z.object({
  hero: heroSchema,
  manifesto: manifestoSchema,
  disciplines: sectionIntroSchema,
  compliment: z.object({ headline: text(300), support: text(600) }),
  cta: ctaSchema,
});
export type ServicesContentInput = z.infer<typeof servicesContentSchema>;

export const contactContentSchema = z.object({
  hero: heroSchema,
  bridge: z.object({ lines: lines(300) }),
  channels: sectionIntroSchema,
  form: sectionIntroSchema,
  social: sectionIntroSchema,
});
export type ContactContentInput = z.infer<typeof contactContentSchema>;

/** Rich project narrative body (stored on projects.body). */
export const projectBodySchema = z.object({
  intro: text(2000),
  sections: z
    .array(
      z.object({
        heading: text(200),
        body: text(4000),
      }),
    )
    .max(20),
});
export type ProjectBodyInput = z.infer<typeof projectBodySchema>;
