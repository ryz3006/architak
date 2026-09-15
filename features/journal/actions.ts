"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";
import type { JournalStatus } from "@/lib/supabase/database.types";

const journalSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(1000).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived", "trashed"]),
  featured: z.boolean(),
  coverMediaId: z.string().uuid().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  expiryAction: z.enum(["hard_delete", "archive"]),
  lang: z.enum(["", "en", "hi", "ar", "ml", "ta", "kn"]),
  dir: z.enum(["", "auto", "ltr", "rtl"]),
  relatedProjectIds: z.array(z.string().uuid()).max(6),
});

export type JournalActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof journalSchema>, string>>;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseBody(formData: FormData): { intro?: string; sections?: Array<{ heading?: string; body?: string }> } {
  const intro = String(formData.get("body_intro") ?? "").trim();
  const sections: Array<{ heading?: string; body?: string }> = [];
  for (let i = 0; i < 5; i += 1) {
    const heading = String(formData.get(`body_heading_${i}`) ?? "").trim();
    const body = String(formData.get(`body_body_${i}`) ?? "").trim();
    if (!heading && !body) continue;
    sections.push({
      heading: heading || undefined,
      body: body || undefined,
    });
  }
  const result: { intro?: string; sections?: Array<{ heading?: string; body?: string }> } = {};
  if (intro) result.intro = intro;
  if (sections.length > 0) result.sections = sections;
  return result;
}

export async function saveJournalPostAction(
  _prev: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  await requireAdminSession();

  const relatedProjectIds = formData
    .getAll("relatedProjectIds")
    .map((value) => String(value))
    .filter(Boolean);

  const parsed = journalSchema.safeParse({
    slug: String(formData.get("slug") || slugify(String(formData.get("title") || ""))),
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || "",
    status: formData.get("status") || "draft",
    featured: formData.get("featured") === "on",
    coverMediaId: String(formData.get("coverMediaId") || ""),
    expiresAt: String(formData.get("expiresAt") || ""),
    expiryAction: formData.get("expiryAction") || "hard_delete",
    lang: formData.get("lang") || "",
    dir: formData.get("dir") || "",
    relatedProjectIds,
  });

  if (!parsed.success) {
    const fieldErrors: JournalActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]) as keyof NonNullable<JournalActionState["fieldErrors"]>;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const publishedAt =
    parsed.data.status === "published" ? new Date().toISOString() : null;
  const body = parseBody(formData);

  // Validate expires_at is in the future if provided
  let expiresAt: string | null = null;
  if (parsed.data.expiresAt) {
    try {
      const expiresDate = new Date(parsed.data.expiresAt);
      if (isNaN(expiresDate.getTime())) {
        return { ok: false, message: "Invalid expiry date format." };
      }
      expiresAt = expiresDate.toISOString();
    } catch {
      return { ok: false, message: "Invalid expiry date format." };
    }
  }

  try {
    const supabase = getSecretSupabase();

    const { data: saved, error } = await supabase
      .from("journal_posts")
      .upsert(
        {
          slug: parsed.data.slug,
          title: parsed.data.title,
          excerpt: parsed.data.excerpt || null,
          status: parsed.data.status as JournalStatus,
          published_at: publishedAt,
          expires_at: expiresAt,
          expiry_action: parsed.data.expiryAction,
          trashed_at: parsed.data.status === "trashed" ? new Date().toISOString() : null,
          featured: parsed.data.featured,
          cover_media_id: parsed.data.coverMediaId || null,
          lang: parsed.data.lang || null,
          dir: parsed.data.dir || null,
          body: body as never,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .maybeSingle();

    if (error || !saved) {
      console.error("Journal post save failed", error?.code ?? "unknown");
      return {
        ok: false,
        message: "Could not save to Supabase. Confirm the migration has been applied.",
      };
    }

    // Update related projects
    await supabase.from("journal_post_related_projects").delete().eq("journal_post_id", saved.id);
    if (parsed.data.relatedProjectIds.length > 0) {
      await supabase.from("journal_post_related_projects").insert(
        parsed.data.relatedProjectIds.map((projectId, index) => ({
          journal_post_id: saved.id,
          project_id: projectId,
          sort_order: index,
        })),
      );
    }

    await supabase.from("audit_events").insert({
      action: "journal_post.upsert",
      entity_type: "journal_posts",
      after_data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        status: parsed.data.status,
        cover_media_id: parsed.data.coverMediaId || null,
        related_count: parsed.data.relatedProjectIds.length,
      },
    });
  } catch {
    return {
      ok: false,
      message: "CMS database is not reachable yet. Apply the Journal migration first.",
    };
  }

  revalidatePath("/admin/journal");
  revalidatePath(`/journal/${parsed.data.slug}`);
  revalidatePath("/journal");
  redirect(`/admin/journal/${parsed.data.slug}`);
}

export async function deleteJournalPostAction(slug: string): Promise<JournalActionState> {
  await requireAdminSession();

  const clean = slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) {
    return { ok: false, message: "Invalid journal post slug." };
  }

  try {
    const supabase = getSecretSupabase();
    const { data: existing } = await supabase
      .from("journal_posts")
      .select("id, slug, title")
      .eq("slug", clean)
      .maybeSingle();

    if (!existing) {
      return { ok: false, message: "Journal post not found." };
    }

    await supabase.from("journal_post_related_projects").delete().eq("journal_post_id", existing.id);

    const { error } = await supabase.from("journal_posts").delete().eq("id", existing.id);
    if (error) {
      return { ok: false, message: "Could not delete the journal post." };
    }

    await supabase.from("audit_events").insert({
      action: "journal_post.deleted",
      entity_type: "journal_posts",
      entity_id: existing.id,
      before_data: { slug: existing.slug, title: existing.title },
    });
  } catch {
    return { ok: false, message: "Could not delete the journal post." };
  }

  revalidatePath("/admin/journal");
  revalidatePath(`/journal/${clean}`);
  revalidatePath("/journal");
  return { ok: true, message: "Journal post deleted." };
}

export async function trashJournalPostAction(slug: string): Promise<JournalActionState> {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    const { data: existing } = await supabase
      .from("journal_posts")
      .select("id, status")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing || existing.status === "trashed") {
      return { ok: false, message: "Journal post not found or already trashed." };
    }

    const { error } = await supabase
      .from("journal_posts")
      .update({ status: "trashed", trashed_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) {
      return { ok: false, message: "Could not trash the journal post." };
    }

    await supabase.from("audit_events").insert({
      action: "journal_post.trashed",
      entity_type: "journal_posts",
      entity_id: existing.id,
    });
  } catch {
    return { ok: false, message: "Could not trash the journal post." };
  }

  revalidatePath("/admin/journal");
  revalidatePath(`/journal/${slug}`);
  revalidatePath("/journal");
  return { ok: true, message: "Journal post moved to trash." };
}

export async function restoreJournalPostAction(slug: string): Promise<JournalActionState> {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    const { data: existing } = await supabase
      .from("journal_posts")
      .select("id, status")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing || existing.status !== "trashed") {
      return { ok: false, message: "Journal post not found or not in trash." };
    }

    const { error } = await supabase
      .from("journal_posts")
      .update({ status: "draft", trashed_at: null })
      .eq("id", existing.id);

    if (error) {
      return { ok: false, message: "Could not restore the journal post." };
    }

    await supabase.from("audit_events").insert({
      action: "journal_post.restored",
      entity_type: "journal_posts",
      entity_id: existing.id,
    });
  } catch {
    return { ok: false, message: "Could not restore the journal post." };
  }

  revalidatePath("/admin/journal");
  revalidatePath(`/journal/${slug}`);
  revalidatePath("/journal");
  return { ok: true, message: "Journal post restored to drafts." };
}

export async function emptyTrashAction(): Promise<JournalActionState> {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    const { data: trashed } = await supabase
      .from("journal_posts")
      .select("id")
      .eq("status", "trashed");

    if (!trashed || trashed.length === 0) {
      return { ok: true, message: "Trash is already empty." };
    }

    const trashedIds = trashed.map((post) => post.id);

    // Delete related projects first
    await supabase.from("journal_post_related_projects").delete().in("journal_post_id", trashedIds);

    // Delete posts
    const { error } = await supabase.from("journal_posts").delete().in("id", trashedIds);

    if (error) {
      return { ok: false, message: "Could not empty trash." };
    }

    await supabase.from("audit_events").insert({
      action: "journal_posts.trash_emptied",
      entity_type: "journal_posts",
      after_data: { deleted_count: trashedIds.length },
    });

    revalidatePath("/admin/journal");
    return { ok: true, message: `Deleted ${trashedIds.length} post(s) from trash.` };
  } catch {
    return { ok: false, message: "Could not empty trash." };
  }
}
