import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApplicationStatus } from "@/generated/prisma/client";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";
import {
  ApplicationPipeline,
  type PipelineApplication,
} from "@/components/recruiter/application-pipeline";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Job Applications | HireHub",
};

type JobApplicationsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
};

const applicationStatuses = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFERED,
  ApplicationStatus.REJECTED,
];

type PipelineApplicationRecord = {
  id: string;
  status: PipelineApplication["status"];
  appliedAt: Date;
  resumeUrl: string | null;
  job: { id: string; title: string };
  candidate: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      skills: { name: string }[];
    } | null;
  };
  interviews: { title: string; scheduledAt: Date }[];
};

export default async function JobApplicationsPage({
  params,
  searchParams,
}: JobApplicationsPageProps) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "RECRUITER") {
    redirect("/unauthorized");
  }

  const prisma = getPrisma();
  const job = await prisma.job.findFirst({
    where: { id, recruiterId: user.id },
    select: {
      id: true,
      title: true,
      company: { select: { name: true } },
    },
  });

  if (!job) {
    notFound();
  }

  const applications = await prisma.application.findMany({
    where: { jobId: job.id, job: { recruiterId: user.id } },
    orderBy: [{ appliedAt: "desc" }],
    include: {
      job: {
        select: {
          id: true,
          title: true,
        },
      },
      candidate: {
        include: {
          profile: {
            include: { skills: { select: { name: true } } },
          },
        },
      },
      interviews: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
      },
    },
  });

  const counts = new Map(
    applicationStatuses.map((status) => [
      status,
      applications.filter((application) => application.status === status).length,
    ]),
  );

  return (
    <>
      <DashboardPageHeader
        title={`${job.title} Applications`}
        description={`Review applicants for ${job.company.name} and move them through the hiring pipeline.`}
        action={
          <Link
            href="/recruiter/applications"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary"
          >
            All Applications
          </Link>
        }
      />

      {query.updated === "1" ? (
        <div className="mb-5 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-success">
          Application status updated.
        </div>
      ) : null}

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {applicationStatuses.map((status) => (
          <DashboardMetric
            key={status}
            label={formatConstant(status)}
            value={(counts.get(status) ?? 0).toString()}
          />
        ))}
      </section>

      <ApplicationPipeline
        applications={applications.map(toPipelineApplication)}
        redirectTo={`/recruiter/jobs/${job.id}/applications`}
        emptyTitle="No applications for this job"
        emptyDescription="Candidate applications for this job will appear here once submitted."
      />
    </>
  );
}

function toPipelineApplication(
  application: PipelineApplicationRecord,
): PipelineApplication {
  const profile = application.candidate.profile;
  const candidateName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
    : application.candidate.email;
  const latestInterview = application.interviews[0];

  return {
    id: application.id,
    status: application.status,
    candidateName,
    jobId: application.job.id,
    jobTitle: application.job.title,
    appliedDate: formatDate(application.appliedAt),
    resumeUrl: application.resumeUrl,
    skills: profile?.skills.map((skill) => skill.name) ?? [],
    latestInterview: latestInterview
      ? {
          title: latestInterview.title,
          scheduledAt: formatDateTime(latestInterview.scheduledAt),
        }
      : null,
  };
}

function formatConstant(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
