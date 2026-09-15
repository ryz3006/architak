import { notFound } from "next/navigation";

import { getAdminJournalPost } from "@/features/journal/admin";
import { JournalEditor } from "@/features/journal/journal-editor";
import { requireAdminSession } from "@/features/auth/session";
import { listAdminMedia } from "@/features/media/admin";
import { getSecretSupabase } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export default async function EditJournalPostPage({ params }: Props) {
  await requireAdminSession();
  const { slug } = await params;
  const supabase = getSecretSupabase();

  const [post, media, { data: projects }] = await Promise.all([
    getAdminJournalPost(slug),
    listAdminMedia({ kind: "image", limit: 100 }),
    supabase
      .from("projects")
      .select("id, slug, title")
      .eq("status", "published")
      .order("title"),
  ]);

  if (!post) notFound();

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Edit journal post</h1>
      <p className="mt-2 text-muted">Post ID: {post.id}</p>
      <div className="mt-10">
        <JournalEditor
          initialValues={{
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            body: post.body,
            cover_media_id: post.cover_media_id,
            status: post.status,
            featured: post.featured,
            expires_at: post.expires_at,
            expiry_action: post.expiry_action,
            lang: post.lang,
            dir: post.dir,
            related_project_ids: post.related_project_ids,
          }}
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
