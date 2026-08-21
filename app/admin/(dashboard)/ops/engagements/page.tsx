import Link from "next/link";

import { requireAdminSession } from "@/features/auth/session";

export default async function AdminEngagementsPage() {
  await requireAdminSession();

  return (
    <main id="main-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-display-md">Engagements</h1>
          <p className="mt-2 text-muted">Studio jobs — distinct from public portfolio projects.</p>
        </div>
        <Link href="/admin/ops" className="text-fluid-sm text-accent">
          ← Operations
        </Link>
      </div>
      <div className="mt-12 border border-border p-8">
        <h2 className="display text-fluid-xl">Stub ready</h2>
        <p className="measure mt-3 text-muted">
          List and detail screens land after the Phase 7 migration is applied. Estimates, invoices,
          and BOM remain structured stubs until accounting depth is required.
        </p>
      </div>
    </main>
  );
}
