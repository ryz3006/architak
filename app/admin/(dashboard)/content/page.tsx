import {
  Building2,
  FileText,
  LayoutTemplate,
  ListChecks,
  Quote,
  Video,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/admin/ui/card";
import { requireAdminSession } from "@/features/auth/session";

const SECTIONS = [
  {
    href: "/admin/content/pages",
    title: "Pages",
    description: "Edit copy for Home, Studio, Services and Contact.",
    icon: LayoutTemplate,
  },
  {
    href: "/admin/content/business",
    title: "Business details",
    description: "Studio name, contact info and social links.",
    icon: Building2,
  },
  {
    href: "/admin/content/services",
    title: "Services list",
    description: "Discipline cards shown across the site.",
    icon: ListChecks,
  },
  {
    href: "/admin/content/videos",
    title: "Videos",
    description: "Featured reels for Home and Studio.",
    icon: Video,
  },
  {
    href: "/admin/content/testimonials",
    title: "Testimonials",
    description: "Client voices shown on Studio.",
    icon: Quote,
  },
];

export default async function AdminContentHubPage() {
  await requireAdminSession();

  return (
    <main id="main-content">
      <PageHeader
        title="Content"
        description="Everything editorial on the public site — pages, lists and media-driven sections."
      />

      <h3 className="mb-3 flex items-center gap-2 text-fluid-sm font-medium text-muted">
        <FileText className="size-4" aria-hidden="true" /> Sections
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href} className="rounded-[var(--admin-radius)]">
              <Card className="h-full transition-colors hover:border-[var(--admin-border-strong)]">
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--admin-radius-sm)] bg-[var(--admin-surface-raised)]">
                    <Icon className="size-4 text-accent" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription className="mt-1">{section.description}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
