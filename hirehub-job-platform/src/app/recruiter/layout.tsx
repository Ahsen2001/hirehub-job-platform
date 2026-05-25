import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

const recruiterNavItems = [
  { label: "Dashboard", href: "/recruiter/dashboard", marker: "D" },
  { label: "My Jobs", href: "/recruiter/jobs", marker: "J" },
  { label: "Create Job", href: "/recruiter/jobs/create", marker: "+" },
  { label: "Applications", href: "/recruiter/applications", marker: "A" },
  { label: "Interviews", href: "/recruiter/interviews", marker: "I" },
];

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout
      expectedRole="RECRUITER"
      roleLabel="RECRUITER"
      navItems={recruiterNavItems}
    >
      {children}
    </DashboardLayout>
  );
}
