"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";

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

export async function saveProjectAction(
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  await requireAdminSession();

  const parsed = projectSchema.safeParse({
    slug: String(formData.get("slug") || slugify(String(formData.get("title") || ""))),
    title: formData.get("title"),
    summary: formData.get("summary") || "",
    location: formData.get("location") || "",
    status: formData.get("status") || "draft",
    isFeatured: formData.get("isFeatured") === "on",
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

  try {
    const supabase = getSecretSupabase();
    const { error } = await supabase.from("projects").upsert(
      {
        slug: parsed.data.slug,
        title: parsed.data.title,
        summary: parsed.data.summary || null,
        location: parsed.data.location || null,
        status: parsed.data.status,
        is_featured: parsed.data.isFeatured,
        published_at: publishedAt,
      },
      { onConflict: "slug" },
    );

    if (error) {
      console.error("Project save failed", error.code ?? "unknown");
      return {
        ok: false,
        message: "Could not save to Supabase. Confirm the migration has been applied.",
      };
    }

    await supabase.from("audit_events").insert({
      action: "project.upsert",
      entity_type: "projects",
      after_data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        status: parsed.data.status,
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
