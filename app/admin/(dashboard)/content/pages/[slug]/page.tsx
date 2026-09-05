import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import {
  ContactEditor,
  HomeEditor,
  ServicesEditor,
  StudioEditor,
} from "@/components/admin/content/page-editors";
import { Button } from "@/components/admin/ui/button";
import {
  getContactContentInput,
  getHomeContentInput,
  getServicesContentInput,
  getStudioContentInput,
} from "@/features/content/admin";
import { requireAdminSession } from "@/features/auth/session";
import Link from "next/link";

const META: Record<string, { title: string; description: string; preview: string }> = {
  home: { title: "Home page", description: "Edit the homepage copy.", preview: "/" },
  studio: { title: "Studio page", description: "Edit the Studio page copy.", preview: "/studio" },
  services: { title: "Services page", description: "Edit the Services page copy.", preview: "/services" },
  contact: { title: "Contact page", description: "Edit the Contact page copy.", preview: "/contact" },
};

export default async function AdminPageEditor({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminSession();
  const { slug } = await params;
  const meta = META[slug];
  if (!meta) notFound();

  async function renderEditor() {
    switch (slug) {
      case "home":
        return <HomeEditor initial={await getHomeContentInput()} />;
      case "studio":
        return <StudioEditor initial={await getStudioContentInput()} />;
      case "services":
        return <ServicesEditor initial={await getServicesContentInput()} />;
      case "contact":
        return <ContactEditor initial={await getContactContentInput()} />;
      default:
        return null;
    }
  }

  return (
    <main id="main-content">
      <PageHeader
        title={meta.title}
        description={meta.description}
        actions={
          <Link href={meta.preview} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              Preview page
            </Button>
          </Link>
        }
      />
      {await renderEditor()}
    </main>
  );
}
