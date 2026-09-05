import { Building2, FileText, LayoutTemplate, ListChecks } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/admin/ui/card";
import { requireAdminSession } from "@/features/auth/session";

const PAGE_EDITORS = [
  { href: "/admin/content/pages/home", title: "Home", description: "Manifesto, space story and hero chapters." },
  { href: "/admin/content/pages/studio", title: "Studio", description: "Hero, belief, work intros and CTA." },
  { href: "/admin/content/pages/services", title: "Services", description: "Hero, approach and disciplines copy." },
  { href: "/admin/content/pages/contact", title: "Contact", description: "Hero, channels and form copy." },
];

const GLOBAL_EDITORS = [
  {
    href: "/admin/content/business",
    title: "Business details",
    description: "Studio name, contact info and social links.",
    icon: Building2,
  },
  {
    href: "/admin/content/services",
    title: "Services list",
    description: "The discipline cards shown across the site.",
    icon: ListChecks,
  },
];

export default async function AdminContentPagesPage() {
  await requireAdminSession();

  return (
    <main id="main-content">
      <PageHeader
        title="Pages"
        description="Edit the words on your public pages. Changes publish immediately."
      />

      <h3 className="mb-3 flex items-center gap-2 text-fluid-sm font-medium text-muted">
        <FileText className="size-4" aria-hidden="true" /> Page copy
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {PAGE_EDITORS.map((page) => (
          <Link key={page.href} href={page.href} className="rounded-[var(--admin-radius)]">
            <Card className="h-full transition-colors hover:border-[var(--admin-border-strong)]">
              <CardContent className="flex items-start gap-3 p-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--admin-radius-sm)] bg-[var(--admin-surface-raised)]">
                  <LayoutTemplate className="size-4 text-accent" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle>{page.title}</CardTitle>
                  <CardDescription className="mt-1">{page.description}</CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h3 className="mb-3 mt-8 flex items-center gap-2 text-fluid-sm font-medium text-muted">
        <Building2 className="size-4" aria-hidden="true" /> Shared content
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {GLOBAL_EDITORS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="rounded-[var(--admin-radius)]">
              <Card className="h-full transition-colors hover:border-[var(--admin-border-strong)]">
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--admin-radius-sm)] bg-[var(--admin-surface-raised)]">
                    <Icon className="size-4 text-accent" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription className="mt-1">{item.description}</CardDescription>
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
