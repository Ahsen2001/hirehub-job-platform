import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function CandidateSettingsPage() {
  return (
    <DashboardPlaceholder
      title="Settings"
      description="Update notification preferences and account security."
      metrics={[
        { label: "Email alerts", value: "On" },
        { label: "Visibility", value: "Public" },
        { label: "Security", value: "Good" },
      ]}
    />
  );
}
