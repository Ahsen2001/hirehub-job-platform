import type { Metadata } from "next";
import {
  DashboardMetric,
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard | HireHub",
};

export default function AdminDashboardPage() {
  return (
    <DashboardShell title="Admin Dashboard" badge="ADMIN">
      <DashboardMetric label="Platform users" value="128" />
      <DashboardMetric label="Active companies" value="24" />
      <DashboardMetric label="Open jobs" value="86" />
    </DashboardShell>
  );
}
