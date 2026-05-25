import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export default function CandidateProfilePage() {
  return (
    <DashboardPlaceholder
      title="Profile"
      description="Manage your personal details, CV, skills, and experience."
      metrics={[
        { label: "Profile strength", value: "82%" },
        { label: "Skills", value: "10" },
        { label: "CV status", value: "Ready" },
      ]}
    />
  );
}
