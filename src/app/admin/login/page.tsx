"use client";

import { useActionState } from "react";
import { login, type AuthState } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glow w-full max-w-sm">
        <div className="card relative z-10 p-8">
          <h1 className="text-xl font-semibold">Owner login</h1>
          <p className="mt-1 text-sm text-muted">
            Sign in to manage your portfolio.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-400">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary w-full"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-xs text-muted">
            Default password is <code>admin123</code>. Change it from the
            dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
