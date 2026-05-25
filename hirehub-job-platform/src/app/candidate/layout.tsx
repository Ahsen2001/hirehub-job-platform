import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

const candidateNavItems = [
  { label: "Dashboard", href: "/candidate/dashboard", marker: "D" },
  { label: "Profile", href: "/candidate/profile", marker: "P" },
  { label: "Browse Jobs", href: "/candidate/jobs", marker: "J" },
  { label: "My Applications", href: "/candidate/applications", marker: "A" },
  { label: "Settings", href: "/candidate/settings", marker: "S" },
];

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout
      expectedRole="CANDIDATE"
      roleLabel="CANDIDATE"
      navItems={candidateNavItems}
    >
      {children}
    </DashboardLayout>
  );
}
