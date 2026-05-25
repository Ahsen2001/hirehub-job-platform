"use client";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";

export default function RecruiterJobsError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <>
      <DashboardPageHeader
        title="My Jobs"
        description="Something went wrong while loading recruiter job management."
      />
      <div className="rounded-card border border-red-100 bg-red-50 p-5 text-sm font-medium text-danger">
        <p>Unable to load jobs right now.</p>
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
