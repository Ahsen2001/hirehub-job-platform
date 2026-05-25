import type { Metadata } from "next";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Recruiter Dashboard | HireHub",
};

export default function RecruiterDashboardPage() {
  return (
    <>
      <DashboardPageHeader
        title="Recruiter Dashboard"
        description="Manage your job posts, applications, and interview pipeline."
      />
      <section className="grid gap-5 lg:grid-cols-3">
        <DashboardMetric label="Open roles" value="8" />
        <DashboardMetric label="Applications" value="42" />
        <DashboardMetric label="Interviews" value="6" />
      </section>
    </>
  );
}
