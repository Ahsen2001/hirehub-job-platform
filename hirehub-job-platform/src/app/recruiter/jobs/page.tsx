import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function RecruiterJobsPage() {
  return (
    <DashboardPlaceholder
      title="My Jobs"
      description="Manage your open, draft, and closed job posts."
      metrics={[
        { label: "Open jobs", value: "8" },
        { label: "Drafts", value: "2" },
        { label: "Closed", value: "5" },
      ]}
    />
  );
}
