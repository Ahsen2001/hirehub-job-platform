import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";

export default function AdminDashboardLoading() {
  return (
    <>
      <DashboardPageHeader
        title="Admin Dashboard"
        description="Loading platform analytics."
      />
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </section>
      <div className="mt-6 h-80 animate-pulse rounded-card border border-border bg-white shadow-card" />
    </>
  );
}
