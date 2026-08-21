import { AdminShell } from "@/components/admin/shell";
import { requireAdminSession } from "@/features/auth/session";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();

  return <AdminShell username={session.u}>{children}</AdminShell>;
}
