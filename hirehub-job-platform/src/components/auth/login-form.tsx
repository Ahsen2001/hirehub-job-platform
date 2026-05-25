"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginUser, type AuthActionState } from "@/app/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginUser, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-danger">
          {state.error}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-semibold text-dark">
        Email
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-dark">
        Password
        <input
          name="password"
          type="password"
          required
          placeholder="Enter your password"
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}
