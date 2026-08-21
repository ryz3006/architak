import Link from "next/link";

import { requireAdminSession } from "@/features/auth/session";
import { listAdminClients } from "@/features/ops/admin";

export default async function AdminClientsPage() {
  await requireAdminSession();
  const clients = await listAdminClients();

  return (
    <main id="main-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-display-md">Clients</h1>
          <p className="mt-2 text-muted">Operational contacts — never published on the public site.</p>
        </div>
        <Link href="/admin/ops" className="text-fluid-sm text-accent">
          ← Operations
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="mt-12 border border-border p-8">
          <h2 className="display text-fluid-xl">No clients yet</h2>
          <p className="measure mt-3 text-muted">
            Apply the Phase 7 migration, then add clients here. Documents attach under{" "}
            <code>private/clients/</code>.
          </p>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {clients.map((client) => (
            <li key={client.id} className="border border-border p-4">
              <p className="text-fluid-lg">{client.name}</p>
              <p className="mt-1 text-fluid-sm text-muted">
                {[client.email, client.phone].filter(Boolean).join(" · ") || "No contact details"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
