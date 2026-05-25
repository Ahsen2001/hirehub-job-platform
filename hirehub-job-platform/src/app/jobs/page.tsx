import type { Metadata } from "next";
import { JobsFilter } from "@/components/jobs/jobs-filter";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { jobCategories, jobLocations, jobs, jobTypes } from "@/data/jobs";

export const metadata: Metadata = {
  title: "Jobs | HireHub",
  description: "Search open jobs by title, location, category, and job type.",
};

export default function JobsPage() {
  return (
    <MainLayout>
      <section className="border-b border-border bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Badge variant="primary">Open opportunities</Badge>
          <h1 className="mt-4 text-3xl font-bold text-dark sm:text-4xl">
            Find jobs that match your next move
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Browse curated roles from trusted employers. Filter by location,
            category, and job type using mock data that can later be replaced
            by Supabase PostgreSQL queries.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <JobsFilter
          jobs={jobs}
          locations={jobLocations}
          categories={jobCategories}
          types={jobTypes}
        />
      </section>
    </MainLayout>
  );
}
