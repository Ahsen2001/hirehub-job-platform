import type { Metadata } from "next";
import {
  DashboardMetric,
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Candidate Dashboard | HireHub",
};

export default function CandidateDashboardPage() {
  return (
    <DashboardShell title="Candidate Dashboard" badge="CANDIDATE">
      <DashboardMetric label="Applications sent" value="5" />
      <DashboardMetric label="Interviews scheduled" value="2" />
      <DashboardMetric label="Saved jobs" value="12" />
    </DashboardShell>
  );
}
