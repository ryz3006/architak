import { AdminShell } from "@/components/admin/shell";
import { requireAdminSession } from "@/features/auth/session";
import { idleTimeoutSeconds } from "@/features/auth/session-token";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();

  return (
    <AdminShell username={session.u} idleTimeoutMinutes={Math.round(idleTimeoutSeconds() / 60)}>
      {children}
    </AdminShell>
  );
}
