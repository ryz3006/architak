import {
  ArrowLeftRight,
  Briefcase,
  FolderArchive,
  FolderOpen,
  Gauge,
  HeartPulse,
  Image,
  Inbox,
  LayoutTemplate,
  type LucideIcon,
  Quote,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path (used for the dashboard root). */
  exact?: boolean;
  description?: string;
  /** Optional keyword aliases to improve command-palette search. */
  keywords?: string[];
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

/**
 * Grouped admin navigation. Replaces the previous flat 9-item list with a
 * task-oriented information architecture:
 *  - Overview: at-a-glance metrics
 *  - Content: everything that appears on the public site
 *  - Leads: enquiries / CRM
 *  - Growth: SEO + redirects
 *  - Operations: internal studio ops
 *  - System: health, settings, security
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: Gauge,
        exact: true,
        description: "Stats and recent activity",
        keywords: ["home", "stats", "analytics", "metrics"],
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        href: "/admin/content/pages",
        label: "Pages",
        icon: LayoutTemplate,
        description: "Edit copy for Home, Studio, Services, Contact",
        keywords: ["copy", "text", "home", "studio", "services", "contact", "hero"],
      },
      {
        href: "/admin/projects",
        label: "Projects",
        icon: FolderOpen,
        description: "Portfolio work",
        keywords: ["portfolio", "work"],
      },
      {
        href: "/admin/media",
        label: "Gallery",
        icon: Image,
        description: "Images and video assets",
        keywords: ["media", "images", "photos", "uploads", "assets"],
      },
      {
        href: "/admin/content/videos",
        label: "Videos",
        icon: Video,
        description: "Featured video reels",
        keywords: ["reels", "featured"],
      },
      {
        href: "/admin/content/testimonials",
        label: "Testimonials",
        icon: Quote,
        description: "Client voices",
        keywords: ["voices", "quotes", "reviews"],
      },
      {
        href: "/admin/website-management",
        label: "Placement",
        icon: LayoutTemplate,
        description: "What shows on Home and Studio",
        keywords: ["homepage", "featured", "sections", "layout", "website"],
      },
    ],
  },
  {
    id: "leads",
    label: "Leads",
    items: [
      {
        href: "/admin/enquiries",
        label: "Enquiries",
        icon: Inbox,
        description: "Contact form leads",
        keywords: ["leads", "contacts", "messages", "crm", "inbox"],
      },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    items: [
      {
        href: "/admin/seo",
        label: "SEO",
        icon: Search,
        description: "Page metadata and discovery",
        keywords: ["meta", "search", "discovery", "title", "description"],
      },
      {
        href: "/admin/redirects",
        label: "Redirects",
        icon: ArrowLeftRight,
        description: "URL redirects",
        keywords: ["url", "301", "forward"],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        href: "/admin/ops/clients",
        label: "Clients",
        icon: Users,
        description: "People and organisations",
        keywords: ["customers", "contacts"],
      },
      {
        href: "/admin/ops/engagements",
        label: "Engagements",
        icon: Briefcase,
        description: "Active studio jobs",
        keywords: ["jobs", "projects", "work"],
      },
      {
        href: "/admin/ops/documents",
        label: "Documents",
        icon: FolderArchive,
        description: "Private files",
        keywords: ["files", "docs"],
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        href: "/admin/system-health",
        label: "System Health",
        icon: HeartPulse,
        description: "Dependency status",
        keywords: ["status", "uptime", "monitoring"],
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: Settings,
        description: "Configuration and notifications",
        keywords: ["config", "env", "telegram", "notifications"],
      },
      {
        href: "/admin/security",
        label: "Security",
        icon: ShieldCheck,
        description: "Sessions and access",
        keywords: ["sessions", "logout", "audit", "login"],
      },
    ],
  },
];

/** Flattened list of all nav items (for the command palette + lookups). */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV.flatMap((group) => group.items);

/** Human labels for path segments used when building breadcrumbs. */
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  content: "Content",
  pages: "Pages",
  projects: "Projects",
  media: "Gallery",
  videos: "Videos",
  testimonials: "Testimonials",
  "website-management": "Placement",
  enquiries: "Enquiries",
  seo: "SEO",
  redirects: "Redirects",
  ops: "Operations",
  clients: "Clients",
  engagements: "Engagements",
  documents: "Documents",
  "system-health": "System Health",
  settings: "Settings",
  security: "Security",
  new: "New",
};

export type Breadcrumb = { label: string; href: string; current: boolean };

function prettifySegment(segment: string): string {
  const decoded = decodeURIComponent(segment);
  if (SEGMENT_LABELS[decoded]) return SEGMENT_LABELS[decoded];
  // Dynamic ids/slugs: title-case a readable version.
  return decoded
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Build breadcrumbs from the current pathname. The `admin` root maps to
 * "Dashboard"; deeper segments use the label map with a readable fallback.
 */
export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Breadcrumb[] = [];
  let href = "";

  parts.forEach((segment, index) => {
    href += `/${segment}`;
    const isLast = index === parts.length - 1;
    if (segment === "admin") {
      crumbs.push({ label: "Dashboard", href: "/admin", current: isLast });
      return;
    }
    crumbs.push({ label: prettifySegment(segment), href, current: isLast });
  });

  return crumbs;
}

/** The label for the current page (last breadcrumb), for the header title. */
export function getPageTitle(pathname: string): string {
  const crumbs = getBreadcrumbs(pathname);
  return crumbs.at(-1)?.label ?? "Admin";
}
