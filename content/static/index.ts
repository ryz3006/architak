import site from "@/content/static/site.json";

export type StaticProject = (typeof site.featuredProjects)[number];
export type StaticService = (typeof site.services)[number];
export type HeroChapter = (typeof site.heroChapters)[number];
export type HeroImage = (typeof site.heroImages)[number];
export type HeroJourney = (typeof site.heroJourneys)[number];

export type HeroJourneyResolved = {
  id: string;
  experience: HeroImage;
  space: HeroImage;
  feel: HeroImage;
};

export function getStaticSite() {
  return site;
}

export function getStaticProjects(): StaticProject[] {
  return site.featuredProjects;
}

export function getStaticProjectBySlug(slug: string): StaticProject | undefined {
  return site.featuredProjects.find((project) => project.slug === slug);
}

export function getStaticServices(): StaticService[] {
  return site.services;
}

export function getHeroChapters(): HeroChapter[] {
  return site.heroChapters;
}

export function getHeroImages(): HeroImage[] {
  return site.heroImages;
}

export function getHeroImageById(id: string): HeroImage | undefined {
  return site.heroImages.find((image) => image.id === id);
}

export function getHeroJourneys(): HeroJourney[] {
  return site.heroJourneys;
}

export function getHeroJourneyById(id: string): HeroJourney | undefined {
  return site.heroJourneys.find((journey) => journey.id === id);
}

export function getManifesto(): string {
  return site.manifesto;
}

export type SpaceStoryStep = (typeof site.spaceStory.steps)[number];

export type SpaceStory = typeof site.spaceStory;

export function getSpaceStory(): SpaceStory {
  return site.spaceStory;
}

export type StudioPageContent = typeof site.studioPage;
export type ServicesPageContent = typeof site.servicesPage;

export type EditorialHero = StudioPageContent["hero"];
export type EditorialManifesto = StudioPageContent["manifesto"];
export type EditorialIntro = StudioPageContent["work"];
export type EditorialBridge = StudioPageContent["workBridge"];
export type EditorialProcess = StudioPageContent["process"];
export type EditorialCompliment = StudioPageContent["compliment"];
export type Testimonial = (typeof site.testimonials)[number];

export function getStudioPageContent(): StudioPageContent {
  return site.studioPage;
}

export function getServicesPageContent(): ServicesPageContent {
  return site.servicesPage;
}

export function getTestimonials(): Testimonial[] {
  return site.testimonials;
}
