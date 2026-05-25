"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type LoginRole = "candidate" | "recruiter";

const redirectByRole: Record<LoginRole, string> = {
  candidate: "/jobs",
  recruiter: "/unauthorized",
};

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>("candidate");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    window.setTimeout(() => {
      router.push(redirectByRole[role]);
    }, 350);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="grid gap-2 text-sm font-semibold text-dark">
        Email
        <input
          type="email"
          required
          placeholder="you@example.com"
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-dark">
        Password
        <input
          type="password"
          required
          placeholder="Enter your password"
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <div className="grid gap-2 text-sm font-semibold text-dark">
        Account type
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {(["candidate", "recruiter"] as LoginRole[]).map((item) => (
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

      <Button className="w-full" size="lg" isLoading={isLoading}>
        Sign in
      </Button>
    </form>
  );
}
