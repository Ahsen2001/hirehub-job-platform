import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function RecruiterCreateJobPage() {
  return (
    <DashboardPlaceholder
      title="Create Job"
      description="Create a new job post and publish it to HireHub candidates."
      metrics={[
        { label: "Required fields", value: "7" },
        { label: "Draft autosave", value: "On" },
        { label: "Posting status", value: "Draft" },
      ]}
    />
  );
}
