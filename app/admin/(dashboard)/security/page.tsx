import { CheckCircle2, Clock, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { SessionActions } from "@/components/admin/security-session-actions";
import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { listLoginEvents } from "@/features/auth/audit";
import { getSecurityOverview } from "@/features/auth/security";
import { requireAdminSession } from "@/features/auth/session";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relative(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 60) return `${mins >= 0 ? "in " : ""}${Math.abs(mins)}m${mins < 0 ? " ago" : ""}`;
  const hours = Math.round(mins / 60);
  return `${hours >= 0 ? "in " : ""}${Math.abs(hours)}h${hours < 0 ? " ago" : ""}`;
}

const STRENGTH_BADGE = {
  weak: { variant: "danger" as const, label: "Weak" },
  fair: { variant: "warning" as const, label: "Fair" },
  strong: { variant: "success" as const, label: "Strong" },
};

export default async function AdminSecurityPage() {
  await requireAdminSession();
  const [overview, events] = await Promise.all([getSecurityOverview(), listLoginEvents(15)]);
  const { session, password, rateLimitBackend } = overview;
  const strength = STRENGTH_BADGE[password.strength];

  return (
    <main id="main-content">
      <PageHeader
        title="Security & sessions"
        description="Review your session, access protections and recent sign-in activity."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Current session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent" aria-hidden="true" /> Current session
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {session ? (
              <>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-fluid-sm">
                  <dt className="text-muted">Signed in as</dt>
                  <dd className="text-foreground">{session.username}</dd>
                  <dt className="text-muted">Signed in</dt>
                  <dd className="text-foreground">{formatDateTime(session.issuedAt)}</dd>
                  <dt className="text-muted">Idle expiry</dt>
                  <dd className="text-foreground">
                    {relative(session.idleExpiresAt)}{" "}
                    <span className="text-muted">({session.idleTimeoutMinutes}m idle limit)</span>
                  </dd>
                  <dt className="text-muted">Session expires</dt>
                  <dd className="text-foreground">
                    {formatDateTime(session.absoluteExpiresAt)}{" "}
                    <span className="text-muted">({session.absoluteTimeoutHours}h max)</span>
                  </dd>
                </dl>
                <SessionActions />
              </>
            ) : (
              <p className="text-fluid-sm text-muted">No active session.</p>
            )}
          </CardContent>
        </Card>

        {/* Protections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4 text-accent" aria-hidden="true" /> Protections
            </CardTitle>
            <CardDescription>How the admin is defended.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3 text-fluid-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted">Rate limiting</span>
                <Badge variant={rateLimitBackend === "upstash" ? "success" : "warning"}>
                  {rateLimitBackend === "upstash" ? "Durable (Upstash)" : "In-memory"}
                </Badge>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted">Idle auto sign-out</span>
                <Badge variant="success">
                  {session ? `${session.idleTimeoutMinutes} minutes` : "Enabled"}
                </Badge>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted">Session cookie</span>
                <Badge variant="success">HttpOnly · signed</Badge>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted">CSRF (same-origin)</span>
                <Badge variant="success">Enforced</Badge>
              </li>
            </ul>
            {rateLimitBackend !== "upstash" ? (
              <p className="mt-3 text-fluid-xs text-muted">
                Set <code>UPSTASH_REDIS_REST_URL</code> and <code>UPSTASH_REDIS_REST_TOKEN</code> to
                enable durable, multi-region rate limiting.
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Password policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-accent" aria-hidden="true" /> Admin credential
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-fluid-sm text-muted">Strength</span>
              <Badge variant={strength.variant}>{strength.label}</Badge>
              <span className="text-fluid-xs text-muted">{password.length} characters</span>
            </div>
            {password.issues.length > 0 ? (
              <ul className="flex flex-col gap-1.5 text-fluid-sm">
                {password.issues.map((issue) => (
                  <li key={issue} className="flex items-center gap-2 text-[var(--admin-warning)]">
                    <ShieldAlert className="size-4 shrink-0" aria-hidden="true" /> {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 text-fluid-sm text-[var(--admin-success)]">
                <CheckCircle2 className="size-4" aria-hidden="true" /> Meets the recommended policy.
              </p>
            )}
            <p className="text-fluid-xs text-muted">
              Update <code>ADMIN_PASSWORD</code> in your environment and redeploy to change it.
            </p>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent sign-in activity</CardTitle>
            <CardDescription>The latest admin authentication events.</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <EmptyState title="No sign-in activity yet" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge variant={event.success ? "success" : "danger"}>
                          {event.action === "auth.login_succeeded"
                            ? "Signed in"
                            : event.action === "auth.login_failed"
                              ? "Failed login"
                              : event.action === "auth.sessions_revoked"
                                ? "Revoked sessions"
                                : event.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.username ?? "—"}</TableCell>
                      <TableCell className="text-muted">{event.ip ?? "—"}</TableCell>
                      <TableCell className="text-muted">{formatDateTime(event.at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
