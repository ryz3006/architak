import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";
import { PAGE_SEO } from "@/features/discovery/page-seo";
import { scoreSeoEntry, type SeoQualityResult } from "@/features/seo/quality";
import { revalidatePath } from "next/cache";

export type SeoSubject = {
  metadataId: string;
  subjectType: "global" | "page" | "project";
  subjectId: string | null;
  path: string;
  label: string;
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  robots: string | null;
  openGraph: Record<string, unknown>;
  quality: SeoQualityResult;
  updatedAt: string;
};

export type SeoVersion = {
  id: number;
  version_number: number;
  title: string | null;
  description: string | null;
  canonical_url: string | null;
  robots: string | null;
  open_graph: unknown;
  quality_score: number | null;
  changed_by: string | null;
  change_summary: string | null;
  created_at: string;
};

const PATH_BY_SLUG: Record<string, string> = {
  home: "/",
  studio: "/studio",
  services: "/services",
  contact: "/contact",
};

export async function listAdminSeoSubjects(): Promise<SeoSubject[]> {
  await requireAdminSession();
  const subjects: SeoSubject[] = [];

  try {
    const supabase = getSecretSupabase();
    const { data: pages } = await supabase
      .from("pages")
      .select("id, slug, title")
      .in("slug", ["home", "studio", "services", "contact"]);

    const { data: seoRows } = await supabase
      .from("seo_metadata")
      .select("*")
      .eq("subject_type", "page");

    const seoBySubject = new Map((seoRows ?? []).map((row) => [row.subject_id, row]));

    for (const page of pages ?? []) {
      const path = PATH_BY_SLUG[page.slug] ?? `/${page.slug}`;
      const fallback = PAGE_SEO.find((entry) => entry.path === path);
      let row = seoBySubject.get(page.id);

      if (!row && fallback) {
        const { data: created } = await supabase
          .from("seo_metadata")
          .insert({
            subject_type: "page",
            subject_id: page.id,
            title: fallback.title,
            description: fallback.description,
            open_graph: { path },
          })
          .select("*")
          .maybeSingle();
        row = created ?? undefined;
      }

      if (!row) continue;

      const title = row.title || fallback?.title || page.title;
      const description = row.description || fallback?.description || "";
      subjects.push({
        metadataId: row.id,
        subjectType: "page",
        subjectId: page.id,
        path,
        label: page.title,
        title,
        description,
        canonicalUrl: row.canonical_url,
        robots: row.robots,
        openGraph:
          row.open_graph && typeof row.open_graph === "object" && !Array.isArray(row.open_graph)
            ? (row.open_graph as Record<string, unknown>)
            : {},
        quality: scoreSeoEntry({ title, description, canonicalUrl: row.canonical_url, robots: row.robots, openGraph: row.open_graph }),
        updatedAt: row.updated_at,
      });
    }

    // Also surface defaults if pages table empty
    if (subjects.length === 0) {
      for (const entry of PAGE_SEO) {
        subjects.push({
          metadataId: `static:${entry.path}`,
          subjectType: "page",
          subjectId: null,
          path: entry.path,
          label: entry.title,
          title: entry.title,
          description: entry.description,
          canonicalUrl: null,
          robots: null,
          openGraph: {},
          quality: scoreSeoEntry({
            title: entry.title,
            description: entry.description,
          }),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch {
    for (const entry of PAGE_SEO) {
      subjects.push({
        metadataId: `static:${entry.path}`,
        subjectType: "page",
        subjectId: null,
        path: entry.path,
        label: entry.title,
        title: entry.title,
        description: entry.description,
        canonicalUrl: null,
        robots: null,
        openGraph: {},
        quality: scoreSeoEntry({
          title: entry.title,
          description: entry.description,
        }),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return subjects;
}

export async function listSeoVersions(metadataId: string): Promise<SeoVersion[]> {
  await requireAdminSession();
  if (metadataId.startsWith("static:")) return [];

  try {
    const supabase = getSecretSupabase();
    const { data } = await supabase
      .from("seo_versions")
      .select(
        "id, version_number, title, description, canonical_url, robots, open_graph, quality_score, changed_by, change_summary, created_at",
      )
      .eq("seo_metadata_id", metadataId)
      .order("version_number", { ascending: false })
      .limit(20);
    return (data as SeoVersion[]) ?? [];
  } catch {
    return [];
  }
}

export async function saveSeoSubject(input: {
  metadataId: string;
  title: string;
  description: string;
  canonicalUrl?: string;
  robots?: string;
  changedBy: string;
}): Promise<{ ok: boolean; message: string }> {
  await requireAdminSession();
  if (input.metadataId.startsWith("static:")) {
    return { ok: false, message: "Apply the database migration to enable SEO editing." };
  }

  try {
    const supabase = getSecretSupabase();
    const { data: current } = await supabase
      .from("seo_metadata")
      .select("*")
      .eq("id", input.metadataId)
      .maybeSingle();

    if (!current) return { ok: false, message: "SEO record not found." };

    const { data: latest } = await supabase
      .from("seo_versions")
      .select("version_number")
      .eq("seo_metadata_id", input.metadataId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latest?.version_number ?? 0) + 1;
    const quality = scoreSeoEntry({
      title: current.title,
      description: current.description,
      canonicalUrl: current.canonical_url,
      robots: current.robots,
      openGraph: current.open_graph,
    });

    await supabase.from("seo_versions").insert({
      seo_metadata_id: input.metadataId,
      version_number: nextVersion,
      title: current.title,
      description: current.description,
      canonical_url: current.canonical_url,
      robots: current.robots,
      open_graph: current.open_graph,
      structured_data: current.structured_data,
      ai_summary: current.ai_summary,
      quality_score: quality.score,
      changed_by: input.changedBy,
      change_summary: "Snapshot before update",
    });

    // Keep max 20 versions
    const { data: allVersions } = await supabase
      .from("seo_versions")
      .select("id, version_number")
      .eq("seo_metadata_id", input.metadataId)
      .order("version_number", { ascending: false });

    if (allVersions && allVersions.length > 20) {
      const toDelete = allVersions.slice(20).map((v) => v.id);
      await supabase.from("seo_versions").delete().in("id", toDelete);
    }

    const newQuality = scoreSeoEntry({
      title: input.title,
      description: input.description,
      canonicalUrl: input.canonicalUrl || null,
      robots: input.robots || null,
      openGraph: current.open_graph,
    });

    const { error } = await supabase
      .from("seo_metadata")
      .update({
        title: input.title.slice(0, 200),
        description: input.description.slice(0, 500),
        canonical_url: input.canonicalUrl || null,
        robots: input.robots || null,
      })
      .eq("id", input.metadataId);

    if (error) return { ok: false, message: "Could not save SEO." };

    await supabase.from("audit_events").insert({
      action: "seo.updated",
      entity_type: "seo_metadata",
      entity_id: input.metadataId,
      before_data: { title: current.title, description: current.description },
      after_data: {
        title: input.title,
        description: input.description,
        quality: newQuality.score,
      },
    });

    const og = current.open_graph as { path?: string } | null;
    if (og?.path) revalidatePath(og.path);
    revalidatePath("/admin/seo");

    return { ok: true, message: "SEO saved." };
  } catch {
    return { ok: false, message: "Could not save SEO. Confirm migrations are applied." };
  }
}

export async function revertSeoVersion(input: {
  metadataId: string;
  versionNumber: number;
  changedBy: string;
}): Promise<{ ok: boolean; message: string }> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { data: version } = await supabase
      .from("seo_versions")
      .select("*")
      .eq("seo_metadata_id", input.metadataId)
      .eq("version_number", input.versionNumber)
      .maybeSingle();

    if (!version) return { ok: false, message: "Version not found." };

    // Snapshot current before revert
    await saveSeoSubject({
      metadataId: input.metadataId,
      title: version.title || "",
      description: version.description || "",
      canonicalUrl: version.canonical_url || undefined,
      robots: version.robots || undefined,
      changedBy: input.changedBy,
    });

    return { ok: true, message: `Reverted to version ${input.versionNumber}.` };
  } catch {
    return { ok: false, message: "Revert failed." };
  }
}
