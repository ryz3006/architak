import { getStaticProjects, getStaticServices, getStaticSite } from "@/content/static";

/**
 * Single discovery index.
 *
 * sitemap.xml, llms.txt, and /api/v1/discover all read from here so the three
 * surfaces can never disagree about what is published. When the CMS becomes the
 * source of truth this module is the only place that changes.
 */

export type DiscoveryRoute = {
  path: string;
  title: string;
  description: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

export type DiscoveryProject = {
  slug: string;
  path: string;
  title: string;
  category: string;
  location: string;
  summary: string;
  coverImage: string;
};

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://architak.in";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getStaticRoutes(): DiscoveryRoute[] {
  const { studio } = getStaticSite();

  return [
    {
      path: "/",
      title: "ARCHITAK — Interiors Studio, Kochi",
      description: studio.statement,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      path: "/work",
      title: "Work",
      description: "Selected ARCHITAK interiors across residential, hospitality, and commercial.",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      path: "/studio",
      title: "Studio",
      description: `Interiors practice in ${studio.location}. Concept, design, and development.`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/services",
      title: "Services",
      description: "Hospitality, residential, corporate, restaurant, commercial, and industrial.",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/contact",
      title: "Contact",
      description: `Reach ARCHITAK at ${studio.phone} or ${studio.email}.`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

export function getPublishedProjects(): DiscoveryProject[] {
  return getStaticProjects().map((project) => ({
    slug: project.slug,
    path: `/work/${project.slug}`,
    title: project.title,
    category: project.category,
    location: project.location,
    summary: project.summary,
    coverImage: project.coverImage,
  }));
}

export function getPublishedProject(slug: string): DiscoveryProject | undefined {
  return getPublishedProjects().find((project) => project.slug === slug);
}

/** Comma-separated env list into trimmed, de-duplicated tokens. */
function parseAgentList(raw: string | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((token) => token.trim())
        .filter((token) => token.length > 0),
    ),
  );
}

export function getCrawlerPolicy(): { allow: string[]; deny: string[] } {
  const deny = parseAgentList(process.env.DISCOVERY_AI_CRAWLERS_DENY);
  const denySet = new Set(deny.map((token) => token.toLowerCase()));

  // An explicit deny always wins over an allow entry for the same agent.
  const allow = parseAgentList(process.env.DISCOVERY_AI_CRAWLERS_ALLOW).filter(
    (token) => !denySet.has(token.toLowerCase()),
  );

  return { allow, deny };
}

export function isDiscoverApiEnabled(): boolean {
  return process.env.DISCOVERY_PUBLIC_API_ENABLED === "true";
}

export function isLlmsFullEnabled(): boolean {
  return process.env.DISCOVERY_LLMS_FULL_ENABLED === "true";
}

export function getAdminPath(): string {
  return process.env.ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";
}

/**
 * Paths that must never be indexed or exposed to a discovery surface:
 * the admin area, write APIs, and internal-only routes.
 */
export function getDisallowedPaths(): string[] {
  const admin = getAdminPath();
  return [admin, `${admin}/`, "/api/", "/dev/"];
}

export function buildLlmsText(options: { full: boolean }): string {
  const site = getStaticSite();
  const routes = getStaticRoutes();
  const projects = getPublishedProjects();
  const services = getStaticServices();

  const lines: string[] = [
    `# ${site.studio.name}`,
    "",
    `> ${site.studio.tagline}. Interior design studio in ${site.studio.location}.`,
    "",
    site.studio.statement,
    "",
    "## Studio",
    "",
    `- Location: ${site.studio.address}`,
    `- Phone: ${site.studio.phone}`,
    `- Email: ${site.studio.email}`,
    "",
    "## Pages",
    "",
    ...routes.map((route) => `- [${route.title}](${absoluteUrl(route.path)}): ${route.description}`),
    "",
    "## Practice areas",
    "",
    ...services.map((service) => `- ${service.title}: ${service.description}`),
    "",
    "## Projects",
    "",
    ...projects.map(
      (project) =>
        `- [${project.title}](${absoluteUrl(project.path)}): ${project.category} in ${project.location}. ${project.summary}`,
    ),
  ];

  if (options.full) {
    lines.push(
      "",
      "## Process",
      "",
      ...site.studio.process.map((step) => `### ${step.step} ${step.title}\n\n${step.description}`),
    );
  }

  lines.push(
    "",
    "## Notes for agents",
    "",
    "- Content above is published and safe to quote with attribution.",
    `- Do not crawl ${getDisallowedPaths().join(", ")}.`,
    "- Enquiries and unpublished drafts are never exposed here.",
    "",
  );

  return lines.join("\n");
}
