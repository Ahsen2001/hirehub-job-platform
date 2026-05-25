import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function CandidateJobsPage() {
  return (
    <DashboardPlaceholder
      title="Browse Jobs"
      description="Find roles matched to your profile and application history."
      metrics={[
        { label: "Recommended", value: "18" },
        { label: "Remote roles", value: "9" },
        { label: "Saved searches", value: "3" },
      ]}
    />
  );
}
