import Link from "next/link";

import { requireAdminSession } from "@/features/auth/session";

export default async function AdminOpsDocumentsPage() {
  await requireAdminSession();

  return (
    <main id="main-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-display-md">Documents</h1>
          <p className="mt-2 text-muted">
            Private engagement files — signed download only, never via media.architak.in.
          </p>
        </div>
        <Link href="/admin/ops" className="text-fluid-sm text-accent">
          ← Operations
        </Link>
      </div>
      <div className="mt-12 border border-border p-8">
        <h2 className="display text-fluid-xl">Private storage ready</h2>
        <p className="measure mt-3 text-muted">
          R2 prefixes <code>private/clients</code>, <code>private/invoices</code>,{" "}
          <code>private/bom</code>, <code>private/drawings</code>, and{" "}
          <code>private/vendors</code> are reserved. Attach UI follows client CRUD.
        </p>
      </div>
    </main>
  );
}
