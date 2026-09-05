import { SeoEditorCard } from "@/components/admin/seo-editor-card";
import { listAdminSeoSubjects, listSeoVersions } from "@/features/seo/admin";
import { requireAdminSession } from "@/features/auth/session";
import { getStaticRoutes, getPublishedProjects } from "@/features/discovery";

export default async function AdminSeoPage() {
  await requireAdminSession();
  const subjects = await listAdminSeoSubjects();
  const withVersions = await Promise.all(
    subjects.map(async (subject) => ({
      subject,
      versions: await listSeoVersions(subject.metadataId),
    })),
  );
  const routes = getStaticRoutes();
  const projects = getPublishedProjects();

  const overall =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.quality.score, 0) / subjects.length)
      : 0;
  const grade =
    overall >= 90 ? "Excellent" : overall >= 70 ? "Good" : overall >= 50 ? "Needs Work" : "Poor";

  return (
    <main id="main-content">
      <h1 className="display text-display-md">SEO</h1>
      <p className="measure mt-2 text-muted">
        Manage titles, descriptions, and indexing for public pages. Discovery surfaces share one
        index. Version history keeps the last 20 changes per subject.
      </p>

      <section className="mt-10 border border-border p-5">
        <p className="text-fluid-xs tracking-widest text-muted uppercase">SEO health</p>
        <p className="display mt-2 text-display-sm">
          {overall} / 100 · {grade}
        </p>
        <p className="mt-2 text-fluid-sm text-muted">
          Quality scoring checks length, brand, location, OG completeness, and uniqueness — no
          external APIs required.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="display text-fluid-xl">Page SEO</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {withVersions.map(({ subject, versions }) => (
            <SeoEditorCard key={subject.metadataId} subject={subject} versions={versions} />
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="display text-fluid-xl">Discovery index</h2>
        <p className="mt-2 text-fluid-sm text-muted">
          Sitemap, llms.txt, and /api/v1/discover read from the same routes.
        </p>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {routes.map((route) => (
            <li key={route.path} className="py-4">
              <p className="text-fluid-sm">{route.path}</p>
              <p className="text-fluid-xs text-muted">{route.title}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="display text-fluid-xl">Published projects</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {projects.map((project) => (
            <li key={project.slug} className="py-4">
              <p className="text-fluid-sm">{project.path}</p>
              <p className="text-fluid-xs text-muted">{project.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
