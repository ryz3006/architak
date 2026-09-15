import { requireAdminSession } from "@/features/auth/session";
import { listAdminMedia } from "@/features/media/admin";
import { JournalEditor } from "@/features/journal/journal-editor";
import { getSecretSupabase } from "@/lib/supabase/server";

export default async function NewJournalPostPage() {
  await requireAdminSession();
  const supabase = getSecretSupabase();

  const [media, { data: projects }] = await Promise.all([
    listAdminMedia({ kind: "image", limit: 100 }),
    supabase
      .from("projects")
      .select("id, slug, title")
      .eq("status", "published")
      .order("title"),
  ]);

  return (
    <main id="main-content">
      <h1 className="display text-display-md">New journal post</h1>
      <p className="mt-2 text-muted">
        Create insights, case studies, and announcements with optional expiry.
      </p>
      <div className="mt-10">
        <JournalEditor
          mediaOptions={media.map((asset) => ({
            id: asset.id,
            label: asset.alt_text || asset.storage_key.split("/").pop() || asset.id,
            publicUrl: asset.publicUrl,
            kind: asset.kind,
          }))}
          projectOptions={(projects ?? []).map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
          }))}
        />
      </div>
    </main>
  );
}
