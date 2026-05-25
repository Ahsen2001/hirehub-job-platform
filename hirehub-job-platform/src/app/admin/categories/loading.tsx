import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";

export default function AdminCategoriesLoading() {
  return (
    <>
      <DashboardPageHeader
        title="Categories"
        description="Loading job category management."
      />
      <section className="grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </section>
      <div className="mt-6 h-28 animate-pulse rounded-card border border-border bg-white shadow-card" />
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-card border border-border bg-white shadow-card"
          />
        ))}
      </div>
    </>
  );
}
