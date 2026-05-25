import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function AdminSettingsPage() {
  return (
    <DashboardPlaceholder
      title="Settings"
      description="Configure public platform settings and operational controls."
      metrics={[
        { label: "Public settings", value: "4" },
        { label: "Private settings", value: "8" },
        { label: "Last updated", value: "Today" },
      ]}
    />
  );
}
