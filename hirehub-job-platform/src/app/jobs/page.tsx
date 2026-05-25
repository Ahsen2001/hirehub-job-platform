import type { Metadata } from "next";
import { JobStatus, JobType } from "@/generated/prisma/client";
import { JobCard } from "@/components/jobs/job-card";
import { JobsFilter } from "@/components/jobs/jobs-filter";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Jobs | HireHub",
  description: "Search open jobs by title, company, location, category, and job type.",
};

type JobsPageProps = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    category?: string;
    type?: string;
  }>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const query = normalize(params.q);
  const location = normalize(params.location);
  const category = normalize(params.category);
  const type = normalize(params.type);
  const prisma = getPrisma();
  const selectedType = isJobType(type) ? type : undefined;

  const [categories, locations, jobs] = await Promise.all([
    prisma.jobCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.job.findMany({
      where: { status: JobStatus.OPEN },
      distinct: ["location"],
      orderBy: { location: "asc" },
      select: { location: true },
    }),
    prisma.job.findMany({
      where: {
        status: JobStatus.OPEN,
        location: location || undefined,
        categoryId: category || undefined,
        type: selectedType,
        OR: query
          ? [
              { title: { contains: query, mode: "insensitive" } },
              { company: { name: { contains: query, mode: "insensitive" } } },
            ]
          : undefined,
      },
      include: {
        company: true,
        category: true,
      },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <MainLayout>
      <section className="border-b border-border bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Badge variant="primary">Open opportunities</Badge>
          <h1 className="mt-4 text-3xl font-bold text-dark sm:text-4xl">
            Find jobs that match your next move
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Browse open roles from the HireHub database and filter by company,
            category, location, and job type.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <JobsFilter
            query={query}
            location={location}
            category={category}
            type={selectedType ?? ""}
            locations={locations.map((item) => item.location)}
            categories={categories}
          />

          {jobs.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No jobs found"
              description="Try changing your search terms or filters to discover more open roles."
            />
          )}
        </div>
      </section>
    </MainLayout>
  );
}

function normalize(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

function isJobType(value: string): value is JobType {
  return Object.values(JobType).includes(value as JobType);
}
