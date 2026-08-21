import { notFound } from "next/navigation";

import { getAdminProject } from "@/features/projects/admin";
import { ProjectEditor } from "@/features/projects/project-editor";
import { requireAdminSession } from "@/features/auth/session";

type Props = { params: Promise<{ slug: string }> };

export default async function EditProjectPage({ params }: Props) {
  await requireAdminSession();
  const { slug } = await params;
  const project = await getAdminProject(slug);
  if (!project) notFound();

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Edit project</h1>
      <p className="mt-2 text-muted">
        Source: {project.source === "cms" ? "Supabase CMS" : "static fallback"}
      </p>
      <div className="mt-10">
        <ProjectEditor
          initialValues={{
            slug: project.slug,
            title: project.title,
            summary: project.summary,
            location: project.location,
            status: project.status,
            is_featured: "is_featured" in project ? Boolean(project.is_featured) : false,
          }}
        />
      </div>
    </main>
  );
}
