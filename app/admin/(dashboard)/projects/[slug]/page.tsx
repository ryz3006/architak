import { notFound } from "next/navigation";

import { getAdminProject } from "@/features/projects/admin";
import { ProjectEditor } from "@/features/projects/project-editor";
import { requireAdminSession } from "@/features/auth/session";
import { listAdminMedia } from "@/features/media/admin";

type Props = { params: Promise<{ slug: string }> };

export default async function EditProjectPage({ params }: Props) {
  await requireAdminSession();
  const { slug } = await params;
  const [project, media] = await Promise.all([
    getAdminProject(slug),
    listAdminMedia({ kind: "image", limit: 100 }),
  ]);
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
            is_featured: project.is_featured,
            category: project.category_slug ?? "residential",
            cover_media_id: project.cover_media_id,
            gallery_media_ids: project.gallery_media_ids,
            body: project.body,
            testimonials: project.testimonials,
          }}
          mediaOptions={media.map((asset) => ({
            id: asset.id,
            label: asset.alt_text || asset.storage_key.split("/").pop() || asset.id,
            publicUrl: asset.publicUrl,
            kind: asset.kind,
          }))}
        />
      </div>
    </main>
  );
}
