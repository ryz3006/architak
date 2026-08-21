import { logoutAction } from "@/features/auth/actions";
import { requireAdminSession } from "@/features/auth/session";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="mt-4 text-muted">
        Signed in as <span className="text-foreground">{session.u}</span>. CMS modules arrive in
        Phase 5.
      </p>
      <form action={logoutAction} className="mt-10">
        <button
          type="submit"
          className="border border-border px-5 py-2 text-sm tracking-widest uppercase hover:border-accent"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
