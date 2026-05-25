import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function AdminCategoriesPage() {
  return (
    <DashboardPlaceholder
      title="Categories"
      description="Maintain job categories used across public listings."
      metrics={[
        { label: "Categories", value: "5" },
        { label: "Featured", value: "3" },
        { label: "Unused", value: "0" },
      ]}
    />
  );
}
