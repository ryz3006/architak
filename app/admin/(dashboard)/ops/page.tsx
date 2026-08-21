import Link from "next/link";

import { requireAdminSession } from "@/features/auth/session";

export default async function AdminOpsPage() {
  await requireAdminSession();

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Operations</h1>
      <p className="measure mt-2 text-muted">
        Foundation for clients and engagements. Portfolio work stays under Projects; ops files stay
        under private R2 prefixes.
      </p>

      <ul className="mt-10 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr))]">
        {[
          { href: "/admin/ops/clients", label: "Clients", blurb: "People and organisations." },
          { href: "/admin/ops/engagements", label: "Engagements", blurb: "Active studio jobs." },
          {
            href: "/admin/ops/documents",
            label: "Documents",
            blurb: "Private files via signed URLs.",
          },
        ].map((item) => (
          <li key={item.href} className="border border-border p-5">
            <h2 className="display text-fluid-xl">{item.label}</h2>
            <p className="mt-2 text-fluid-sm text-muted">{item.blurb}</p>
            <Link href={item.href} className="mt-4 inline-block text-fluid-sm text-accent">
              Open →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
