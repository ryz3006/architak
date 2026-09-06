import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectsList } from "@/components/admin/projects-list";
import { Button } from "@/components/admin/ui/button";
import { requireAdminSession } from "@/features/auth/session";
import { listAdminProjects } from "@/features/projects/admin";

export default async function AdminProjectsPage() {
  await requireAdminSession();
  const projects = await listAdminProjects();

  return (
    <main id="main-content">
      <PageHeader
        title="Projects"
        description="Create, edit and publish portfolio work for the public site."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">New project</Link>
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create the first project, or apply the Supabase seed so mirrored work appears here."
          action={
            <Button asChild>
              <Link href="/admin/projects/new">New project</Link>
            </Button>
          }
        />
      ) : (
        <ProjectsList
          projects={projects.map((project) => ({
            slug: project.slug,
            title: project.title,
            category: project.category,
            status: project.status,
          }))}
        />
      )}
    </main>
  );
}
