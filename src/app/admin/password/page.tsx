"use client";

import { useActionState } from "react";
import { changePassword, type AuthState } from "../actions";

export default function PasswordPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    changePassword,
    undefined
  );

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">Change password</h1>
      <p className="mt-1 text-muted">
        Update the password you use to access this dashboard.
      </p>

      <form action={formAction} className="card mt-6 space-y-4 p-6">
        <div className="field">
          <label htmlFor="current">Current password</label>
          <input id="current" name="current" type="password" required />
        </div>
        <div className="field">
          <label htmlFor="next">New password</label>
          <input
            id="next"
            name="next"
            type="password"
            required
            minLength={8}
          />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm new password</label>
          <input id="confirm" name="confirm" type="password" required />
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state && !state.error && (
          <p className="text-sm text-green-400">Password updated.</p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
