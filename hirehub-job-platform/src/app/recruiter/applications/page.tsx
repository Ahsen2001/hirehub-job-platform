import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function RecruiterApplicationsPage() {
  return (
    <DashboardPlaceholder
      title="Applications"
      description="Review candidate submissions and move applicants through stages."
      metrics={[
        { label: "New", value: "14" },
        { label: "Shortlisted", value: "9" },
        { label: "Rejected", value: "5" },
      ]}
    />
  );
}
