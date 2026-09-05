"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";
import { replaceProjectTestimonials } from "@/features/projects/testimonials";

const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(1000).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  isFeatured: z.boolean(),
  category: z.string().trim().min(1).max(80).optional().or(z.literal("")),
  coverMediaId: z.string().uuid().optional().or(z.literal("")),
  galleryMediaIds: z.array(z.string().uuid()).max(24),
});

export type ProjectActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof projectSchema>, string>>;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseTestimonials(formData: FormData) {
  const items: Array<{
    quote: string;
    authorName: string;
    authorRole?: string;
    location?: string;
    isEnabled?: boolean;
  }> = [];

  for (let i = 0; i < 3; i += 1) {
    const quote = String(formData.get(`testimonial_quote_${i}`) ?? "").trim();
    const authorName = String(formData.get(`testimonial_name_${i}`) ?? "").trim();
    if (!quote && !authorName) continue;
    items.push({
      quote,
      authorName,
      authorRole: String(formData.get(`testimonial_role_${i}`) ?? "").trim() || undefined,
      location: String(formData.get(`testimonial_location_${i}`) ?? "").trim() || undefined,
      isEnabled: formData.get(`testimonial_enabled_${i}`) === "on",
    });
  }
  return items;
}

export async function saveProjectAction(
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  await requireAdminSession();

  const galleryMediaIds = formData
    .getAll("galleryMediaIds")
    .map((value) => String(value))
    .filter(Boolean);

  const parsed = projectSchema.safeParse({
    slug: String(formData.get("slug") || slugify(String(formData.get("title") || ""))),
    title: formData.get("title"),
    summary: formData.get("summary") || "",
    location: formData.get("location") || "",
    status: formData.get("status") || "draft",
    isFeatured: formData.get("isFeatured") === "on",
    category: formData.get("category") || "",
    coverMediaId: String(formData.get("coverMediaId") || ""),
    galleryMediaIds,
  });

  if (!parsed.success) {
    const fieldErrors: ProjectActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]) as keyof NonNullable<ProjectActionState["fieldErrors"]>;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const publishedAt =
    parsed.data.status === "published" ? new Date().toISOString() : null;
  const testimonials = parseTestimonials(formData);

  try {
    const supabase = getSecretSupabase();

    let categoryId: string | null = null;
    if (parsed.data.category) {
      const slug = parsed.data.category;
      const { data: existing } = await supabase
        .from("project_categories")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (existing) {
        categoryId = existing.id;
      } else {
        const { data: created } = await supabase
          .from("project_categories")
          .insert({
            slug,
            name: slug.charAt(0).toUpperCase() + slug.slice(1),
            status: "published",
            published_at: new Date().toISOString(),
          })
          .select("id")
          .maybeSingle();
        categoryId = created?.id ?? null;
      }
    }

    const { data: saved, error } = await supabase
      .from("projects")
      .upsert(
        {
          slug: parsed.data.slug,
          title: parsed.data.title,
          summary: parsed.data.summary || null,
          location: parsed.data.location || null,
          status: parsed.data.status,
          is_featured: parsed.data.isFeatured,
          published_at: publishedAt,
          category_id: categoryId,
          cover_media_id: parsed.data.coverMediaId || null,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .maybeSingle();

    if (error || !saved) {
      console.error("Project save failed", error?.code ?? "unknown");
      return {
        ok: false,
        message: "Could not save to Supabase. Confirm the migration has been applied.",
      };
    }

    await supabase.from("project_media").delete().eq("project_id", saved.id).eq("role", "gallery");
    if (parsed.data.galleryMediaIds.length > 0) {
      await supabase.from("project_media").insert(
        parsed.data.galleryMediaIds.map((mediaId, index) => ({
          project_id: saved.id,
          media_asset_id: mediaId,
          role: "gallery" as const,
          sort_order: index,
        })),
      );
    }

    await replaceProjectTestimonials(saved.id, testimonials);

    await supabase.from("audit_events").insert({
      action: "project.upsert",
      entity_type: "projects",
      after_data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        status: parsed.data.status,
        cover_media_id: parsed.data.coverMediaId || null,
        gallery_count: parsed.data.galleryMediaIds.length,
      },
    });
  } catch {
    return {
      ok: false,
      message: "CMS database is not reachable yet. Apply the Sprint 0b migration first.",
    };
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/work/${parsed.data.slug}`);
  revalidatePath("/studio");
  revalidatePath("/");
  redirect(`/admin/projects/${parsed.data.slug}`);
}
