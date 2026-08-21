import Link from "next/link";

import { requireAdminSession } from "@/features/auth/session";
import { listAdminProjects } from "@/features/projects/admin";

export default async function AdminProjectsPage() {
  await requireAdminSession();
  const projects = await listAdminProjects();

  return (
    <main id="main-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-display-md">Projects</h1>
          <p className="mt-2 text-muted">Publish portfolio work for the public site.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="border border-foreground bg-foreground px-5 py-2 text-fluid-sm tracking-widest text-background uppercase"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-12 border border-border p-8">
          <h2 className="display text-fluid-xl">No projects yet</h2>
          <p className="measure mt-3 text-muted">
            Create the first project, or apply the Supabase seed so the mirrored WordPress work
            appears here.
          </p>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <table className="hidden w-full min-w-[40rem] border-collapse text-left md:table">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b border-border text-fluid-xs tracking-widest text-muted uppercase">
                <th className="py-3 pr-4 font-medium">Title</th>
                <th className="py-3 pr-4 font-medium">Category</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 font-medium">Preview</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.slug} className="border-b border-border">
                  <td className="py-4 pr-4">
                    <Link href={`/admin/projects/${project.slug}`} className="hover:text-accent">
                      {project.title}
                    </Link>
                  </td>
                  <td className="py-4 pr-4 text-muted">{project.category}</td>
                  <td className="py-4 pr-4 text-muted">{project.status}</td>
                  <td className="py-4">
                    <Link
                      href={`/work/${project.slug}`}
                      className="text-fluid-sm text-accent"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="flex flex-col gap-4 md:hidden">
            {projects.map((project) => (
              <li key={project.slug} className="border border-border p-4">
                <Link href={`/admin/projects/${project.slug}`} className="display text-fluid-xl">
                  {project.title}
                </Link>
                <p className="mt-2 text-fluid-sm text-muted">
                  {project.category} · {project.status}
                </p>
                <Link
                  href={`/work/${project.slug}`}
                  className="mt-3 inline-block text-fluid-sm text-accent"
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
