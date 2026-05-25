import type { Metadata } from "next";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard | HireHub",
};

export default function AdminDashboardPage() {
  return (
    <>
      <DashboardPageHeader
        title="Admin Dashboard"
        description="Monitor users, companies, categories, and platform configuration."
      />
      <section className="grid gap-5 lg:grid-cols-3">
        <DashboardMetric label="Platform users" value="128" />
        <DashboardMetric label="Active companies" value="24" />
        <DashboardMetric label="Open jobs" value="86" />
      </section>
    </>
  );
}
