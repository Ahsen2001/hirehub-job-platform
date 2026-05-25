import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";

export default function RecruiterJobsLoading() {
  return (
    <>
      <DashboardPageHeader
        title="My Jobs"
        description="Loading your recruiter job posts."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </div>
      <div className="mt-6 grid gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </div>
    </>
  );
}
