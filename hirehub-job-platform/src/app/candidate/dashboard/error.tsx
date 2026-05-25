"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function CandidateDashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Unable to load dashboard"
      message="We could not load your candidate dashboard data. Check the database connection and try again."
      action={
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Try again
        </button>
      }
    />
  );
}
