"use client";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";

export default function AdminDashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <>
      <DashboardPageHeader
        title="Admin Dashboard"
        description="Something went wrong while loading platform analytics."
      />
      <div className="rounded-card border border-red-100 bg-red-50 p-5 text-sm font-medium text-danger">
        <p>Unable to load the admin dashboard right now.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-danger px-4 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </>
  );
}
