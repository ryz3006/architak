/**
 * Single source for public page titles and descriptions.
 * Consumed by page metadata exports and getStaticRoutes() discovery index.
 */
export type PageSeoEntry = {
  path: string;
  title: string;
  description: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

export const PAGE_SEO: PageSeoEntry[] = [
  {
    path: "/",
    title: "Interior Design Studio in Kochi",
    description:
      "CREATED TO CREATE. Interior design studio in Vyttila, Kochi — residential, hospitality, corporate, and commercial spaces that become part of how you live.",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/studio",
    title: "Studio — Belief, Work & Practice",
    description:
      "Enter the ARCHITAK studio — what we believe, what we create, the spaces we have shaped, and how life becomes form in Vyttila, Kochi.",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/services",
    title: "Interior Design Services in Kochi",
    description:
      "ARCHITAK services — hospitality, residential, corporate, restaurant, commercial, and industrial interior design in Kochi.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/contact",
    title: "Contact — Let's Connect",
    description:
      "Contact ARCHITAK in Vyttila, Kochi — phone, email, WhatsApp, and project enquiry. Every space starts with a conversation.",
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

export function getPageSeo(path: string): PageSeoEntry | undefined {
  return PAGE_SEO.find((entry) => entry.path === path);
}
