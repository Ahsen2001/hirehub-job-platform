import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function AdminCompaniesPage() {
  return (
    <DashboardPlaceholder
      title="Companies"
      description="View registered companies and verification status."
      metrics={[
        { label: "Companies", value: "24" },
        { label: "Verified", value: "18" },
        { label: "Open jobs", value: "86" },
      ]}
    />
  );
}
