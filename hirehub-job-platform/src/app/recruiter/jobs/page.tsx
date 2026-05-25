import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JobStatus } from "@/generated/prisma/client";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";
import { deleteJob, toggleJobStatus } from "./actions";

export const metadata: Metadata = {
  title: "My Jobs | HireHub",
};

type RecruiterJobsPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    status?: string;
    error?: string;
  }>;
};

export default async function RecruiterJobsPage({
  searchParams,
}: RecruiterJobsPageProps) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "RECRUITER") {
    redirect("/unauthorized");
  }

  const prisma = getPrisma();
  const jobs = await prisma.job.findMany({
    where: { recruiterId: user.id },
    include: {
      company: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const openJobs = jobs.filter((job) => job.status === JobStatus.OPEN).length;
  const closedJobs = jobs.length - openJobs;
  const totalApplications = jobs.reduce(
    (total, job) => total + job._count.applications,
    0,
  );

  return (
    <>
      <DashboardPageHeader
        title="My Jobs"
        description="Create, edit, close, reopen, and delete job posts owned by your recruiter account."
        action={
          <Link
            href="/recruiter/jobs/create"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            Create Job
          </Link>
        }
      />

      <StatusMessage params={params} />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric label="Total jobs" value={jobs.length.toString()} />
        <DashboardMetric label="Open jobs" value={openJobs.toString()} />
        <DashboardMetric label="Closed jobs" value={closedJobs.toString()} />
        <DashboardMetric label="Applications" value={totalApplications.toString()} />
      </section>

      <section className="mt-6">
        {jobs.length > 0 ? (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-dark">{job.title}</h2>
                        <Badge
                          variant={
                            job.status === JobStatus.OPEN ? "success" : "slate"
                          }
                        >
                          {formatConstant(job.status)}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-muted">
                        <span>{job.company.name}</span>
                        <span>{job.category?.name ?? "Uncategorized"}</span>
                        <span>{formatConstant(job.type)}</span>
                        <span>{job.location}</span>
                        <span>{formatSalary(job)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-dark">
                        {job._count.applications} applications
                      </div>
                      <Link
                        href={`/recruiter/jobs/${job.id}/applications`}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-3 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary"
                      >
                        Pipeline
                      </Link>
                      <Link
                        href={`/recruiter/jobs/${job.id}/edit`}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-3 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary"
                      >
                        Edit
                      </Link>
                      <form action={toggleJobStatus}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button
                          type="submit"
                          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-white px-3 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary sm:w-auto"
                        >
                          {job.status === JobStatus.OPEN ? "Close" : "Reopen"}
                        </button>
                      </form>
                      <form action={deleteJob}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button
                          type="submit"
                          disabled={job._count.applications > 0}
                          title={
                            job._count.applications > 0
                              ? "Jobs with applications cannot be deleted."
                              : undefined
                          }
                          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-red-100 bg-white px-3 text-sm font-semibold text-danger transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No job posts yet"
            description="Create your first job post to start receiving candidate applications."
            action={
              <Link
                href="/recruiter/jobs/create"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Create Job
              </Link>
            }
          />
        )}
      </section>
    </>
  );
}

function StatusMessage({
  params,
}: {
  params: Awaited<RecruiterJobsPageProps["searchParams"]>;
}) {
  const success =
    (params.created && "Job created successfully.") ||
    (params.updated && "Job updated successfully.") ||
    (params.deleted && "Job deleted successfully.") ||
    (params.status && "Job status updated.");

  const error =
    params.error === "has_applications"
      ? "Jobs with applications cannot be deleted."
      : params.error === "not_found"
        ? "Job not found or you do not have access to it."
        : params.error === "invalid_job"
          ? "Invalid job id."
          : undefined;

  if (!success && !error) {
    return null;
  }

  return (
    <div
      className={
        error
          ? "mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-danger"
          : "mb-5 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-success"
      }
    >
      {error ?? success}
    </div>
  );
}

function formatConstant(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSalary(job: {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
}) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: job.salaryCurrency,
    maximumFractionDigits: 0,
  });

  if (job.salaryMin !== null && job.salaryMax !== null) {
    return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`;
  }

  if (job.salaryMin !== null) {
    return `From ${formatter.format(job.salaryMin)}`;
  }

  if (job.salaryMax !== null) {
    return `Up to ${formatter.format(job.salaryMax)}`;
  }

  return "Salary not listed";
}
