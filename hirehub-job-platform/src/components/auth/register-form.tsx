"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type RegisterRole = "candidate" | "recruiter";

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<RegisterRole>("candidate");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    window.setTimeout(() => {
      router.push(role === "candidate" ? "/jobs" : "/unauthorized");
    }, 350);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2 text-sm font-semibold text-dark">
        Role
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {(["candidate", "recruiter"] as RegisterRole[]).map((item) => (
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
              {item}
            </button>
          ))}
        </div>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-dark">
        Name
        <input
          required
          placeholder="Full name"
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-dark">
        Email
        <input
          type="email"
          required
          placeholder="you@example.com"
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>

      {role === "candidate" ? (
        <label className="grid gap-2 text-sm font-semibold text-dark">
          Desired role
          <input
            placeholder="Frontend Engineer"
            className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>
      ) : (
        <label className="grid gap-2 text-sm font-semibold text-dark">
          Company name
          <input
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
            type="password"
            required
            placeholder="Create password"
            className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-dark">
          Confirm password
          <input
            type="password"
            required
            placeholder="Confirm password"
            className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <Button className="w-full" size="lg" isLoading={isLoading}>
        Create {role} account
      </Button>
    </form>
  );
}
