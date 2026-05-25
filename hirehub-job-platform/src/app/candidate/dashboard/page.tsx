import type { Metadata } from "next";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Candidate Dashboard | HireHub",
};

export default function CandidateDashboardPage() {
  return (
    <>
      <DashboardPageHeader
        title="Candidate Dashboard"
        description="Track your profile, applications, interviews, and saved jobs."
      />
      <section className="grid gap-5 lg:grid-cols-3">
        <DashboardMetric label="Applications sent" value="5" />
        <DashboardMetric label="Interviews scheduled" value="2" />
        <DashboardMetric label="Saved jobs" value="12" />
      </section>
    </>
  );
}
