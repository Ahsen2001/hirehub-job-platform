import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", marker: "D" },
  { label: "Users", href: "/admin/users", marker: "U" },
  { label: "Recruiters", href: "/admin/recruiters", marker: "R" },
  { label: "Companies", href: "/admin/companies", marker: "C" },
  { label: "Categories", href: "/admin/categories", marker: "G" },
  { label: "Settings", href: "/admin/settings", marker: "S" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout
      expectedRole="ADMIN"
      roleLabel="ADMIN"
      navItems={adminNavItems}
    >
      {children}
    </DashboardLayout>
  );
}
