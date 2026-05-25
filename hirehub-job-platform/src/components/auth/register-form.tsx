"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { registerUser, type AuthActionState } from "@/app/actions/auth";

type RegisterRole = "CANDIDATE" | "RECRUITER";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerUser, initialState);
  const [role, setRole] = useState<RegisterRole>("CANDIDATE");

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-danger">
          {state.error}
        </div>
      ) : null}

      <input type="hidden" name="role" value={role} />

      <div className="grid gap-2 text-sm font-semibold text-dark">
        Role
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {(["CANDIDATE", "RECRUITER"] as RegisterRole[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={
                role === item
                  ? "h-10 rounded-lg bg-white text-sm font-semibold capitalize text-primary shadow-sm"
                  : "h-10 rounded-lg text-sm font-semibold capitalize text-slate-600 transition-colors hover:text-dark"
              }
            >
              {item.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-dark">
        Name
        <input
          name="name"
          required
          placeholder="Full name"
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>

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

      {role === "CANDIDATE" ? (
        <label className="grid gap-2 text-sm font-semibold text-dark">
          Desired role
          <input
            name="desiredRole"
            placeholder="Frontend Engineer"
            className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>
      ) : (
        <label className="grid gap-2 text-sm font-semibold text-dark">
          Company name
          <input
            name="companyName"
            required
            placeholder="Company or agency"
            className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-dark">
          Password
          <input
            name="password"
            type="password"
            required
            placeholder="Create password"
            className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-dark">
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            required
            placeholder="Confirm password"
            className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <SubmitButton role={role} />
    </form>
  );
}

function SubmitButton({ role }: { role: RegisterRole }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? "Creating account..."
        : `Create ${role.toLowerCase()} account`}
    </button>
  );
}
