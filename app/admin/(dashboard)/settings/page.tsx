import { requireAdminSession } from "@/features/auth/session";

const REDACTED = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "CLOUDFLARE_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
  "R2_PUBLIC_BASE_URL",
] as const;

export default async function AdminSettingsPage() {
  await requireAdminSession();

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Settings</h1>
      <p className="measure mt-2 text-muted">
        Configuration lives in environment variables, never in the CMS. This screen only shows which
        names are expected — never their values.
      </p>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {REDACTED.map((name) => {
          const present = Boolean(process.env[name]);
          return (
            <li key={name} className="flex items-center justify-between gap-4 py-3 text-fluid-sm">
              <code>{name}</code>
              <span className={present ? "text-accent" : "text-muted"}>
                {present ? "configured" : "missing"}
              </span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
