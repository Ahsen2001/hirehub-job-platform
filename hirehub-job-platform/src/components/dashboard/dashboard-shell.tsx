import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/cookies";

type DashboardShellProps = {
  title: string;
  badge: string;
  children: ReactNode;
};

export async function DashboardShell({
  title,
  badge,
  children,
}: DashboardShellProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-card border border-border bg-white p-5 shadow-card sm:flex-row sm:items-center">
          <div>
            <Badge variant="primary">{badge}</Badge>
            <h1 className="mt-3 text-2xl font-bold text-dark sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Signed in as {user.name} ({user.email})
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {children}
        </div>
      </section>
    </MainLayout>
  );
}

export function DashboardMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-muted">{label}</p>
      </CardContent>
    </Card>
  );
}
