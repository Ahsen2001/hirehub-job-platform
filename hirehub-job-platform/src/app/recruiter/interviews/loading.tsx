import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";

export default function RecruiterInterviewsLoading() {
  return (
    <>
      <DashboardPageHeader
        title="Interviews"
        description="Loading recruiter interview management."
      />
      <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-80 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </div>
    </>
  );
}
