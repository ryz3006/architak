import { requireAdminSession } from "@/features/auth/session";
import { getStaticRoutes, getPublishedProjects } from "@/features/discovery";

export default async function AdminSeoPage() {
  await requireAdminSession();
  const routes = getStaticRoutes();
  const projects = getPublishedProjects();

  return (
    <main id="main-content">
      <h1 className="display text-display-md">SEO</h1>
      <p className="measure mt-2 text-muted">
        Discovery surfaces share one index. Sitemap, llms.txt, and /api/v1/discover cannot disagree
        about published URLs.
      </p>

      <section className="mt-10">
        <h2 className="display text-fluid-xl">Public routes</h2>
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
