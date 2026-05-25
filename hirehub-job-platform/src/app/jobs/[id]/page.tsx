import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobStatus, JobType } from "@/generated/prisma/client";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

type JobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    applied?: string;
    error?: string;
  }>;
};

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  REMOTE: "Remote",
};

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getPrisma().job.findFirst({
    where: { slug: id, status: JobStatus.OPEN },
    include: { company: true },
  });

  if (!job) {
    return {
      title: "Job not found | HireHub",
    };
  }

  return {
    title: `${job.title} at ${job.company.name} | HireHub`,
    description: job.description,
  };
}

export default async function JobDetailPage({
  params,
  searchParams,
}: JobDetailPageProps) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  const prisma = getPrisma();
  const job = await prisma.job.findFirst({
    where: { slug: id, status: JobStatus.OPEN },
    include: {
      company: true,
      category: true,
      applications: user?.role === "CANDIDATE"
        ? {
            where: { candidateId: user.id },
            select: { id: true, status: true },
          }
        : false,
    },
  });

  if (!job) {
    notFound();
  }

  const existingApplication =
    user?.role === "CANDIDATE" ? job.applications[0] : null;

  return (
    <MainLayout>
      <section className="border-b border-border bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/jobs"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Back to jobs
          </Link>
          <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <Badge variant="primary">{job.category?.name ?? "General"}</Badge>
              <h1 className="mt-4 text-3xl font-bold text-dark sm:text-4xl">
                {job.title}
              </h1>
              <p className="mt-2 text-base font-medium text-muted">
                {job.company.name} / {job.location}
              </p>
            </div>
            <ApplyArea
              slug={job.slug}
              jobId={job.id}
              userRole={user?.role}
              existingApplication={existingApplication}
              applied={query.applied === "1"}
              roleError={query.error === "role"}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job description</CardTitle>
              <CardDescription>
                Role overview and responsibilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted">{job.description}</p>
            </CardContent>
          </Card>

          <ListCard title="Responsibilities" items={job.responsibilities} />
          <ListCard title="Requirements" items={job.requirements} />
          <ListCard title="Benefits" items={job.benefits} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Job summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SummaryItem label="Company" value={job.company.name} />
              <SummaryItem label="Location" value={job.location} />
              <SummaryItem label="Salary" value={formatSalary(job)} />
              <SummaryItem label="Job type" value={jobTypeLabels[job.type]} />
              <SummaryItem
                label="Posted"
                value={formatDate(job.publishedAt ?? job.createdAt)}
              />
              <ApplyArea
                slug={job.slug}
                jobId={job.id}
                userRole={user?.role}
                existingApplication={existingApplication}
                compact
                applied={query.applied === "1"}
                roleError={query.error === "role"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company details</CardTitle>
              <CardDescription>{job.company.industry ?? "Company"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted">
              <p>{job.company.description ?? "No company description yet."}</p>
              <SummaryItem
                label="Company location"
                value={job.company.location ?? "Not specified"}
              />
              <SummaryItem
                label="Company size"
                value={job.company.size ?? "Not specified"}
              />
              {job.company.websiteUrl ? (
                <a
                  href={job.company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary hover:text-primary-dark"
                >
                  Visit website
                </a>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </section>
    </MainLayout>
  );
}

function ApplyArea({
  slug,
  jobId,
  userRole,
  existingApplication,
  applied,
  roleError,
  compact = false,
}: {
  slug: string;
  jobId: string;
  userRole?: string;
  existingApplication: { id: string; status: string } | null;
  applied: boolean;
  roleError: boolean;
  compact?: boolean;
}) {
  if (!userRole) {
    return (
      <Link
        href={`/login?redirect=/jobs/${slug}`}
        className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
      >
        Login to apply
      </Link>
    );
  }

  if (userRole !== "CANDIDATE") {
    return (
      <div className={compact ? "space-y-2" : "max-w-sm"}>
        <button
          disabled
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-slate-100 px-5 text-base font-semibold text-slate-500"
        >
          Candidate only
        </button>
        {roleError ? (
          <p className="text-xs font-medium text-danger">
            Admin and recruiter accounts cannot apply for jobs.
          </p>
        ) : null}
      </div>
    );
  }

  if (existingApplication || applied) {
    return (
      <div className={compact ? "space-y-2" : "max-w-sm"}>
        <Badge variant="success">Application submitted</Badge>
        <p className="mt-2 text-sm text-muted">
          You have already applied for this role.
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/candidate/apply/${jobId}`}
      className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
    >
      Apply now
    </Link>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-muted">
                <span className="mt-2 size-2 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No details provided yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-dark">{value}</p>
    </div>
  );
}

function formatSalary(job: {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
}) {
  if (!job.salaryMin && !job.salaryMax) {
    return "Salary undisclosed";
  }

  if (job.salaryMin && job.salaryMax) {
    return `${job.salaryCurrency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
  }

  return `${job.salaryCurrency} ${(job.salaryMin ?? job.salaryMax)?.toLocaleString()}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
