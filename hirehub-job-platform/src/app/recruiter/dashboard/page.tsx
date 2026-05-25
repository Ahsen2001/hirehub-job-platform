import type { Metadata } from "next";
import {
  DashboardMetric,
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Recruiter Dashboard | HireHub",
};

export default function RecruiterDashboardPage() {
  return (
    <DashboardShell title="Recruiter Dashboard" badge="RECRUITER">
      <DashboardMetric label="Open roles" value="8" />
      <DashboardMetric label="Applications" value="42" />
      <DashboardMetric label="Interviews" value="6" />
    </DashboardShell>
  );
}
