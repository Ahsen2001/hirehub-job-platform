import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function AdminUsersPage() {
  return (
    <DashboardPlaceholder
      title="Users"
      description="Review all platform users and manage account access."
      metrics={[
        { label: "Total users", value: "128" },
        { label: "Active users", value: "119" },
        { label: "Suspended", value: "3" },
      ]}
    />
  );
}
