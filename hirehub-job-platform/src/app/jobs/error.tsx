"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { ErrorState } from "@/components/ui/error-state";

export default function JobsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <MainLayout>
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState
          title="Unable to load jobs"
          message="We could not load open jobs from the database. Check the connection and try again."
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
      </section>
    </MainLayout>
  );
}
