import { getStaticServices, getStaticSite } from "@/content/static";

import { absoluteUrl, getPublishedProjects, getSiteUrl, type DiscoveryProject } from "@/features/discovery";

/**
 * JSON-LD builders.
 *
 * Kept in one module so every page emits consistent identifiers: the studio is
 * always the same @id, which lets search engines merge the graph across pages
 * instead of treating each page as a separate organisation.
 */

const STUDIO_ID = () => `${getSiteUrl()}/#studio`;
const WEBSITE_ID = () => `${getSiteUrl()}/#website`;

function getSocialSameAs(): string[] {
  const social = getStaticSite().studio.social;
  if (!social) return [];
  return [social.linkedin, social.youtube, social.instagram, social.facebook].filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  );
}

export function buildLocalBusinessJsonLd() {
  const { studio } = getStaticSite();
  const sameAs = getSocialSameAs();

  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "InteriorDesignBusiness"],
    "@id": STUDIO_ID(),
    name: studio.name,
    slogan: studio.tagline,
    description: studio.statement,
    url: getSiteUrl(),
    telephone: studio.phone,
    email: studio.email,
    image: absoluteUrl("/brand/logo.png"),
    logo: absoluteUrl("/brand/logo.png"),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    areaServed: { "@type": "City", name: "Kochi" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "ARCK Tower, Neelamuri Line, Ponnurunni, Vyttila",
      addressLocality: "Kochi",
      addressRegion: "Kerala",
      postalCode: "682019",
      addressCountry: "IN",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Interior design services",
      itemListElement: getStaticServices().map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.description,
          serviceType: service.title,
          url: absoluteUrl("/services"),
          provider: { "@id": STUDIO_ID() },
        },
      })),
    },
  };
}

export function buildWebSiteJsonLd() {
  const { studio } = getStaticSite();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID(),
    name: studio.name,
    url: getSiteUrl(),
    description: studio.statement,
    publisher: { "@id": STUDIO_ID() },
    inLanguage: "en-IN",
  };
}

export function buildWebPageJsonLd(path: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": WEBSITE_ID() },
    about: { "@id": STUDIO_ID() },
    inLanguage: "en-IN",
  };
}

export function buildContactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${absoluteUrl("/contact")}#contactpage`,
    name: "Contact ARCHITAK",
    url: absoluteUrl("/contact"),
    isPartOf: { "@id": WEBSITE_ID() },
    about: { "@id": STUDIO_ID() },
    inLanguage: "en-IN",
  };
}

export function buildStudioWorkListJsonLd() {
  const projects = getPublishedProjects();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Selected ARCHITAK interiors",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        "@id": `${absoluteUrl(project.path)}#work`,
        name: project.title,
        url: absoluteUrl(project.path),
      },
    })),
  };
}

export function buildServiceListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ARCHITAK practice areas",
    itemListElement: getStaticServices().map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.description,
        url: absoluteUrl("/services"),
        provider: { "@id": STUDIO_ID() },
        areaServed: { "@type": "City", name: "Kochi" },
      },
    })),
  };
}

export function buildProjectJsonLd(project: DiscoveryProject) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${absoluteUrl(project.path)}#work`,
    name: project.title,
    description: project.summary,
    image: absoluteUrl(project.coverImage),
    url: absoluteUrl(project.path),
    genre: project.category,
    locationCreated: { "@type": "Place", name: project.location },
    creator: { "@id": STUDIO_ID() },
    isPartOf: { "@id": WEBSITE_ID() },
  };
}

export type Breadcrumb = { name: string; path: string };

export function buildBreadcrumbJsonLd(trail: readonly Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Serialises for a <script type="application/ld+json"> tag. */
export function jsonLdScript(payload: unknown): { __html: string } {
  // Escaping `<` prevents a string value from terminating the script element.
  return { __html: JSON.stringify(payload).replaceAll("<", "\\u003c") };
}
