"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/features/auth/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-10 space-y-6">
      <div className="space-y-2">
        <label htmlFor="username" className="block text-xs tracking-widest uppercase text-muted">
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="w-full border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-xs tracking-widest uppercase text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-foreground px-5 py-3 text-sm tracking-widest uppercase disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
