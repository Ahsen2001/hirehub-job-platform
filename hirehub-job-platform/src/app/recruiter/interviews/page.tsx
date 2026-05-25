import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InterviewStatus } from "@/generated/prisma/client";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";
import {
  InterviewManagement,
  type RecruiterInterview,
} from "@/components/recruiter/interview-management";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Interviews | HireHub",
};

type RecruiterInterviewsPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    completed?: string;
    error?: string;
  }>;
};

type InterviewRecord = {
  id: string;
  title: string;
  scheduledAt: Date;
  durationMins: number;
  mode: string;
  status: string;
  meetingUrl: string | null;
  location: string | null;
  feedback: string | null;
  application: {
    jobId: string;
    job: { title: string };
    candidate: {
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      } | null;
    };
  };
};

export default async function RecruiterInterviewsPage({
  searchParams,
}: RecruiterInterviewsPageProps) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "RECRUITER") {
    redirect("/unauthorized");
  }

  const prisma = getPrisma();
  const [applications, interviews] = await Promise.all([
    prisma.application.findMany({
      where: { job: { recruiterId: user.id } },
      orderBy: { appliedAt: "desc" },
      include: {
        job: { select: { title: true } },
        candidate: {
          include: {
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    }),
    prisma.interview.findMany({
      where: { application: { job: { recruiterId: user.id } } },
      orderBy: [{ scheduledAt: "asc" }],
      include: {
        application: {
          select: {
            jobId: true,
            job: { select: { title: true } },
            candidate: {
              select: {
                email: true,
                profile: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const now = new Date();
  const upcoming = interviews.filter(
    (interview) =>
      interview.status === InterviewStatus.SCHEDULED &&
      interview.scheduledAt >= now,
  );
  const past = interviews.filter(
    (interview) =>
      interview.status !== InterviewStatus.SCHEDULED ||
      interview.scheduledAt < now,
  );
  const completed = interviews.filter(
    (interview) => interview.status === InterviewStatus.COMPLETED,
  );

  return (
    <>
      <DashboardPageHeader
        title="Interviews"
        description="Schedule, edit, and complete interviews for applications on your job posts."
      />

      <StatusMessage params={query} />

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric label="Total interviews" value={interviews.length.toString()} />
        <DashboardMetric label="Upcoming" value={upcoming.length.toString()} />
        <DashboardMetric label="Past" value={past.length.toString()} />
        <DashboardMetric label="Completed" value={completed.length.toString()} />
      </section>

      <InterviewManagement
        applicationOptions={applications.map((application) => ({
          id: application.id,
          label: `${getCandidateName(application.candidate)} / ${application.job.title}`,
        }))}
        upcomingInterviews={upcoming.map(toRecruiterInterview)}
        pastInterviews={past.map(toRecruiterInterview)}
      />
    </>
  );
}

function StatusMessage({
  params,
}: {
  params: Awaited<RecruiterInterviewsPageProps["searchParams"]>;
}) {
  const success =
    (params.created && "Interview created successfully.") ||
    (params.updated && "Interview updated successfully.") ||
    (params.completed && "Interview marked as completed.");

  const error =
    params.error === "invalid_interview"
      ? "Invalid interview id."
      : params.error === "not_found"
        ? "Interview not found or you do not have access to it."
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

function toRecruiterInterview(interview: InterviewRecord): RecruiterInterview {
  return {
    id: interview.id,
    title: interview.title,
    candidateName: getCandidateName(interview.application.candidate),
    jobTitle: interview.application.job.title,
    jobId: interview.application.jobId,
    status: interview.status,
    scheduledAtLabel: formatDateTime(interview.scheduledAt),
    scheduledAtInput: toDateTimeLocalValue(interview.scheduledAt),
    durationMins: interview.durationMins,
    mode: interview.mode,
    meetingUrl: interview.meetingUrl,
    location: interview.location,
    feedback: interview.feedback,
  };
}

function getCandidateName(candidate: {
  email: string;
  profile: { firstName: string; lastName: string } | null;
}) {
  return candidate.profile
    ? [candidate.profile.firstName, candidate.profile.lastName]
        .filter(Boolean)
        .join(" ")
    : candidate.email;
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

function toDateTimeLocalValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}
