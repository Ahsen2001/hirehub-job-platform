import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";
import type { Role } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/cookies";

type DashboardLayoutProps = {
  children: ReactNode;
  expectedRole: Role;
  roleLabel: string;
  navItems: DashboardNavItem[];
};

export async function DashboardLayout({
  children,
  expectedRole,
  roleLabel,
  navItems,
}: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== expectedRole) {
    redirect("/unauthorized");
  }

  return (
    <DashboardShell user={user} roleLabel={roleLabel} navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
