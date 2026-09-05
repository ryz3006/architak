import Link from "next/link";

import { StorageBar } from "@/components/admin/storage-bar";
import { requireAdminSession } from "@/features/auth/session";
import { runSystemHealthChecks } from "@/features/health/checks";
import { getStorageUsage } from "@/features/media/storage-accounting";

export default async function SystemHealthPage() {
  await requireAdminSession();
  const [{ checks, overallLabel }, usage] = await Promise.all([
    runSystemHealthChecks(),
    getStorageUsage(),
  ]);

  return (
    <main id="main-content">
      <h1 className="display text-display-md">System health</h1>
      <p className="measure mt-2 text-muted">
        Business-friendly status for the website and its dependencies. Technical details are below.
      </p>

      <section className="mt-10 border border-border p-5">
        <p className="text-fluid-xs tracking-widest text-muted uppercase">Overall</p>
        <p className="display mt-2 text-display-sm">{overallLabel}</p>
      </section>

      <ul className="mt-8 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr))]">
        {checks.map((check) => (
          <li key={check.id} className="border border-border p-5">
            <p className="text-fluid-xs tracking-widest text-muted uppercase">{check.label}</p>
            <p className="mt-3 text-fluid-sm">
              <span className={check.ok ? "text-accent" : "text-red-300"}>●</span>{" "}
              {check.businessStatus}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <StorageBar usage={usage} />
      </div>

      <details className="mt-12 border border-border p-5">
        <summary className="cursor-pointer text-fluid-sm tracking-widest uppercase">
          View technical details
        </summary>
        <ul className="mt-6 space-y-4 text-fluid-sm">
          {checks.map((check) => (
            <li key={check.id} className="border-t border-border pt-4">
              <p className="font-medium">{check.label}</p>
              <p className="mt-1 text-muted">{check.detail}</p>
              <p className="mt-1 text-fluid-xs text-muted">
                Latency: {check.latencyMs != null ? `${check.latencyMs}ms` : "n/a"} · Checked{" "}
                {new Date(check.lastCheckedAt).toLocaleString("en-IN")}
              </p>
            </li>
          ))}
        </ul>
      </details>

      <p className="mt-8 text-fluid-sm">
        <Link href="/admin/settings" className="text-accent">
          Telegram settings →
        </Link>
      </p>
    </main>
  );
}
