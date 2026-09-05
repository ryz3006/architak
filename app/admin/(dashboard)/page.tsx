import { Activity, FolderOpen, HardDrive, Image as ImageIcon, Inbox } from "lucide-react";
import Link from "next/link";

import { CategoryBarChart } from "@/components/admin/charts/category-bar-chart";
import { DonutChart } from "@/components/admin/charts/donut-chart";
import { TrendChart } from "@/components/admin/charts/trend-chart";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Progress } from "@/components/admin/ui/progress";
import { StatCard } from "@/components/admin/ui/stat-card";
import { getDashboardAnalytics } from "@/features/analytics/admin";
import { requireAdminSession } from "@/features/auth/session";
import { getEnquiryMetrics, listAdminEnquiries } from "@/features/enquiries/admin";
import { runSystemHealthChecks } from "@/features/health/checks";
import { getStorageUsage } from "@/features/media/storage-accounting";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const HEALTH_BADGE = {
  healthy: { variant: "success" as const, label: "All systems normal" },
  degraded: { variant: "warning" as const, label: "Needs attention" },
  down: { variant: "danger" as const, label: "Service disruption" },
};

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [analytics, metrics, enquiries, usage, health] = await Promise.all([
    getDashboardAnalytics(),
    getEnquiryMetrics(),
    listAdminEnquiries({ page: 1, pageSize: 5, sort: "newest" }),
    getStorageUsage(),
    runSystemHealthChecks(),
  ]);

  const enquirySpark = analytics.enquiryTrend.slice(-14).map((point) => point.value);
  const storageDonut = [
    { label: "Images", value: Math.max(0, Math.round(usage.imageBytes / 1024 / 1024)) },
    { label: "Videos", value: Math.max(0, Math.round(usage.videoBytes / 1024 / 1024)) },
  ].filter((entry) => entry.value > 0);
  const healthBadge = HEALTH_BADGE[health.overall];

  return (
    <main id="main-content">
      <PageHeader
        title="Dashboard"
        description="Your website at a glance — content, enquiries, storage and health."
        actions={
          <Link href="/admin/system-health">
            <Badge variant={healthBadge.variant}>{healthBadge.label}</Badge>
          </Link>
        }
      />

      {/* KPI cards */}
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={analytics.projects.total}
          icon={FolderOpen}
          href="/admin/projects"
          hint={`${analytics.projects.published} published · ${analytics.projects.draft} draft`}
        />
        <StatCard
          label="New enquiries"
          value={metrics.newCount}
          icon={Inbox}
          href="/admin/enquiries"
          hint={`${metrics.today} today · ${metrics.week} this week`}
          spark={enquirySpark}
        />
        <StatCard
          label="Gallery assets"
          value={usage.assetCount}
          icon={ImageIcon}
          href="/admin/media"
          hint={`${usage.formatted.total} of ${usage.formatted.max} used`}
        />
        <StatCard
          label="Storage used"
          value={`${usage.percentUsed}%`}
          icon={HardDrive}
          href="/admin/media"
          hint={`${usage.formatted.remaining} remaining`}
        />
      </section>

      {/* Charts */}
      <section aria-label="Trends" className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div className="min-w-0">
              <CardTitle>Enquiries over time</CardTitle>
              <p className="text-fluid-sm text-muted">
                {analytics.enquiryTrendTotal} in the last 30 days
              </p>
            </div>
          </CardHeader>
          <CardContent className="min-w-0">
            {analytics.enquiryTrendTotal > 0 ? (
              <TrendChart
                data={analytics.enquiryTrend}
                valueLabel="Enquiries"
                ariaLabel="Enquiries received per day over the last 30 days"
              />
            ) : (
              <p className="py-10 text-center text-fluid-sm text-muted">
                No enquiries in the last 30 days yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Enquiry pipeline</CardTitle>
            <p className="text-fluid-sm text-muted">By status</p>
          </CardHeader>
          <CardContent className="min-w-0">
            {analytics.enquiryStatus.length > 0 ? (
              <CategoryBarChart
                data={analytics.enquiryStatus}
                height={220}
                ariaLabel="Enquiries by status"
              />
            ) : (
              <p className="py-10 text-center text-fluid-sm text-muted">No enquiries yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Composition" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Projects by status</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {analytics.projects.byStatus.length > 0 ? (
              <DonutChart data={analytics.projects.byStatus} ariaLabel="Projects by status" />
            ) : (
              <p className="py-10 text-center text-fluid-sm text-muted">No projects yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle>Storage</CardTitle>
            <Badge
              variant={
                usage.state === "healthy" ? "success" : usage.state === "warning" ? "warning" : "danger"
              }
            >
              {usage.percentUsed}% used
            </Badge>
          </CardHeader>
          <CardContent className="flex min-w-0 flex-col gap-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-fluid-sm">
                <span className="text-muted">{usage.formatted.total} used</span>
                <span className="text-muted">{usage.formatted.max}</span>
              </div>
              <Progress
                value={usage.totalBytes}
                max={usage.maxBytes}
                state={usage.state}
                label="Storage used"
              />
            </div>
            {storageDonut.length > 0 ? (
              <DonutChart data={storageDonut} height={180} ariaLabel="Storage by media type (MB)" />
            ) : (
              <p className="text-fluid-sm text-muted">No media uploaded yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Recent enquiries + activity */}
      <section aria-label="Recent" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle>Recent enquiries</CardTitle>
            <Link href="/admin/enquiries" className="shrink-0 text-fluid-sm text-accent">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {enquiries.items.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No enquiries yet"
                description="Leads from the contact form will appear here."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--admin-border)]">
                {enquiries.items.map((enquiry) => (
                  <li key={enquiry.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/admin/enquiries/${enquiry.id}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{enquiry.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-fluid-sm text-muted">{enquiry.message}</p>
                      </div>
                      <Badge variant="neutral" className="shrink-0 capitalize">
                        {enquiry.status.replace(/_/g, " ")}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.activity.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No recent activity"
                description="Content changes you make will be logged here."
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {analytics.activity.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-fluid-sm">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--admin-surface-raised)]">
                      <Activity className="size-3.5 text-muted" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-foreground">{item.label}</p>
                      <p className="text-fluid-xs text-muted">{item.entityType}</p>
                    </div>
                    <time className="shrink-0 text-fluid-xs text-muted" dateTime={item.at}>
                      {relativeTime(item.at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Alerts */}
      <section aria-label="Alerts" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-fluid-sm">
              <li className="flex items-center gap-2">
                <Badge variant={usage.state === "healthy" ? "success" : "warning"}>Storage</Badge>
                {usage.state === "healthy"
                  ? "Storage healthy"
                  : usage.state === "full"
                    ? "Storage is full — remove unused media"
                    : "Storage approaching the 7 GB limit"}
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={health.overall === "healthy" ? "success" : "warning"}>Website</Badge>
                {health.overall === "healthy"
                  ? "Website operating normally"
                  : "Website needs attention — check System Health"}
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={metrics.newCount > 0 ? "info" : "success"}>Leads</Badge>
                {metrics.newCount > 0
                  ? `${metrics.newCount} new enquiries waiting`
                  : "No new enquiries waiting"}
              </li>
            </ul>
            <div className="mt-4">
              <Link href="/admin/system-health">
                <Button variant="outline" size="sm">
                  View system health
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
