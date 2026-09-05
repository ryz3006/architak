import Link from "next/link";

import { StorageBar } from "@/components/admin/storage-bar";
import { requireAdminSession } from "@/features/auth/session";
import { runSystemHealthChecks } from "@/features/health/checks";
import { getStorageUsage } from "@/features/media/storage-accounting";
import { listAdminProjects } from "@/features/projects/admin";
import { getEnquiryMetrics, listAdminEnquiries } from "@/features/enquiries/admin";
import { listAdminMedia } from "@/features/media/admin";
import { getTelegramConfig } from "@/features/notifications/config";

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [projects, enquiries, media, usage, metrics, health] = await Promise.all([
    listAdminProjects(),
    listAdminEnquiries({ page: 1, pageSize: 5, sort: "newest" }),
    listAdminMedia({ limit: 5 }),
    getStorageUsage(),
    getEnquiryMetrics(),
    runSystemHealthChecks(),
  ]);

  const telegram = getTelegramConfig();
  const published = projects.filter((p) => p.status === "published").length;
  const drafts = projects.filter((p) => p.status === "draft").length;
  const telegramCheck = health.checks.find((c) => c.id === "telegram");

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Dashboard</h1>
      <p className="measure mt-4 text-muted">
        Website control room — content, enquiries, storage, and health at a glance.
      </p>

      <section className="mt-10 border border-border p-5">
        <p className="text-fluid-xs tracking-widest text-muted uppercase">Website health</p>
        <p className="display mt-2 text-display-sm">{health.overallLabel}</p>
        <Link href="/admin/system-health" className="mt-3 inline-block text-fluid-sm text-accent">
          View technical details →
        </Link>
      </section>

      <ul className="mt-8 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr))]">
        <li className="border border-border p-5">
          <p className="text-fluid-xs tracking-widest text-muted uppercase">Projects</p>
          <p className="display mt-2 text-display-sm">{projects.length}</p>
          <p className="mt-2 text-fluid-xs text-muted">
            {published} published · {drafts} draft
          </p>
          <Link href="/admin/projects" className="mt-4 inline-block text-fluid-sm text-accent">
            Open projects →
          </Link>
        </li>
        <li className="border border-border p-5">
          <p className="text-fluid-xs tracking-widest text-muted uppercase">Customer enquiries</p>
          <p className="display mt-2 text-display-sm">{metrics.newCount} new</p>
          <p className="mt-2 text-fluid-xs text-muted">
            Today {metrics.today} · Week {metrics.week} · Month {metrics.month}
          </p>
          <Link href="/admin/enquiries" className="mt-4 inline-block text-fluid-sm text-accent">
            View enquiries →
          </Link>
        </li>
        <li className="border border-border p-5">
          <p className="text-fluid-xs tracking-widest text-muted uppercase">Gallery</p>
          <p className="display mt-2 text-display-sm">{media.length}+</p>
          <p className="mt-2 text-fluid-xs text-muted">{usage.assetCount} assets tracked</p>
          <Link href="/admin/media" className="mt-4 inline-block text-fluid-sm text-accent">
            Open gallery →
          </Link>
        </li>
        <li className="border border-border p-5">
          <p className="text-fluid-xs tracking-widest text-muted uppercase">Telegram</p>
          <p className="display mt-2 text-display-sm">
            {telegram.enabled && telegram.configured ? "On" : "Off"}
          </p>
          <p className="mt-2 text-fluid-xs text-muted">
            {telegramCheck?.businessStatus ?? (telegram.configured ? "Configured" : "Not configured")}
          </p>
          <Link href="/admin/settings" className="mt-4 inline-block text-fluid-sm text-accent">
            Notification settings →
          </Link>
        </li>
      </ul>

      <div className="mt-8">
        <StorageBar usage={usage} />
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="display text-fluid-xl">Recent enquiries</h2>
          <Link href="/admin/enquiries" className="text-fluid-sm text-accent">
            View all
          </Link>
        </div>
        {enquiries.items.length === 0 ? (
          <p className="mt-4 text-fluid-sm text-muted">No enquiries yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {enquiries.items.map((enquiry) => (
              <li key={enquiry.id} className="border border-border p-4">
                <Link href={`/admin/enquiries/${enquiry.id}`} className="display text-fluid-xl">
                  {enquiry.name}
                </Link>
                <p className="mt-1 text-fluid-xs tracking-widest text-muted uppercase">
                  {enquiry.status}
                </p>
                <p className="mt-2 line-clamp-2 text-fluid-sm">{enquiry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="display text-fluid-xl">Alerts</h2>
        <ul className="mt-4 flex flex-col gap-2 text-fluid-sm">
          {usage.state === "warning" || usage.state === "full" ? (
            <li>
              ⚠ Storage {usage.state === "full" ? "is full" : "is approaching the 7 GB limit"} —{" "}
              {usage.formatted.total} used
            </li>
          ) : (
            <li>✓ Storage healthy</li>
          )}
          {health.overall === "healthy" ? (
            <li>✓ Website operating normally</li>
          ) : (
            <li>⚠ Website needs attention — check System Health</li>
          )}
          {metrics.newCount > 0 ? (
            <li>● {metrics.newCount} new enquiries</li>
          ) : (
            <li>✓ No new enquiries waiting</li>
          )}
          {telegram.enabled && !telegram.configured ? (
            <li>⚠ Telegram is enabled but missing bot token or chat ID</li>
          ) : telegramCheck && !telegramCheck.ok ? (
            <li>⚠ Telegram notifications need attention</li>
          ) : telegram.enabled && telegram.configured ? (
            <li>✓ Telegram notifications ready</li>
          ) : (
            <li>✓ Telegram notifications disabled (default in development)</li>
          )}
        </ul>
      </section>
    </main>
  );
}
