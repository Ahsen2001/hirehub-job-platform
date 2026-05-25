import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";

export default function JobApplicationsLoading() {
  return (
    <>
      <DashboardPageHeader
        title="Job Applications"
        description="Loading applications for this job."
      />
      <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-80 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </div>
    </>
  );
}
