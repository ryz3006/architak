import { LoginForm } from "@/features/auth/login-form";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-4xl">Sign in</h1>
      <p className="mt-3 text-sm text-muted">Staff access only. Credentials are configured via env.</p>
      <LoginForm />
    </main>
  );
}
