import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function AdminRecruitersPage() {
  return (
    <DashboardPlaceholder
      title="Recruiters"
      description="Manage recruiter accounts and company associations."
      metrics={[
        { label: "Recruiters", value: "36" },
        { label: "Verified", value: "29" },
        { label: "Pending review", value: "7" },
      ]}
    />
  );
}
