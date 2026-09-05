import { ProjectEditor } from "@/features/projects/project-editor";
import { requireAdminSession } from "@/features/auth/session";
import { listAdminMedia } from "@/features/media/admin";

export default async function NewProjectPage() {
  await requireAdminSession();
  const media = await listAdminMedia({ kind: "image", limit: 100 });

  return (
    <main id="main-content">
      <h1 className="display text-display-md">New project</h1>
      <p className="mt-2 text-muted">Draft first, then publish when the story and media are ready.</p>
      <div className="mt-10">
        <ProjectEditor
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
