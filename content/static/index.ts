import site from "@/content/static/site.json";

export type StaticProject = (typeof site.featuredProjects)[number];
export type StaticService = (typeof site.services)[number];

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
