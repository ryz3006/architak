import Link from "next/link";

import { requireAdminSession } from "@/features/auth/session";
import { getStaticProjects } from "@/content/static";

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const projects = getStaticProjects();

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Dashboard</h1>
      <p className="measure mt-4 text-muted">
        Manage the public site from here. Start with projects and media; leads arrive from the
        contact form.
      </p>

      <ul className="mt-10 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr))]">
        <li className="border border-border p-5">
          <p className="text-fluid-xs tracking-widest text-muted uppercase">Projects</p>
          <p className="display mt-2 text-display-sm">{projects.length}</p>
          <Link href="/admin/projects" className="mt-4 inline-block text-fluid-sm text-accent">
            Open projects →
          </Link>
        </li>
        <li className="border border-border p-5">
          <p className="text-fluid-xs tracking-widest text-muted uppercase">Leads</p>
          <p className="display mt-2 text-display-sm">Inbox</p>
          <Link href="/admin/enquiries" className="mt-4 inline-block text-fluid-sm text-accent">
            Open leads →
          </Link>
        </li>
        <li className="border border-border p-5">
          <p className="text-fluid-xs tracking-widest text-muted uppercase">Media</p>
          <p className="display mt-2 text-display-sm">Library</p>
          <Link href="/admin/media" className="mt-4 inline-block text-fluid-sm text-accent">
            Open media →
          </Link>
        </li>
      </ul>
    </main>
  );
}
