import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function RecruiterInterviewsPage() {
  return (
    <DashboardPlaceholder
      title="Interviews"
      description="Coordinate interview schedules, feedback, and hiring decisions."
      metrics={[
        { label: "Scheduled", value: "6" },
        { label: "Completed", value: "18" },
        { label: "Pending feedback", value: "4" },
      ]}
    />
  );
}
