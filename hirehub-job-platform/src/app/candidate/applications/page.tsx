import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function CandidateApplicationsPage() {
  return (
    <DashboardPlaceholder
      title="My Applications"
      description="Track submitted applications, interviews, offers, and outcomes."
      metrics={[
        { label: "Submitted", value: "5" },
        { label: "Interviews", value: "2" },
        { label: "Offers", value: "1" },
      ]}
    />
  );
}
