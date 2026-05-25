import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "My Applications | HireHub",
};

const statusOrder = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFERED,
  ApplicationStatus.REJECTED,
];

const statusLabels: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFERED: "Offered",
  REJECTED: "Rejected",
};

const statusVariants: Record<
  ApplicationStatus,
  "primary" | "success" | "warning" | "danger" | "slate"
> = {
  APPLIED: "primary",
  SHORTLISTED: "warning",
  INTERVIEW: "primary",
  OFFERED: "success",
  REJECTED: "danger",
};

export default async function CandidateApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect("/login");
  }

  const applications = await getPrisma().application.findMany({
    where: { candidateId: user.id },
    orderBy: { appliedAt: "desc" },
    include: {
      job: {
        include: {
          company: true,
        },
      },
      interviews: {
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  return (
    <>
      <DashboardPageHeader
        title="My Applications"
        description="Track submitted applications, interviews, offers, and outcomes."
        action={
          <Link
            href="/jobs"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Browse Jobs
          </Link>
        }
      />

      {query.submitted === "1" ? (
        <div className="mb-5 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-success">
          Application submitted successfully.
        </div>
      ) : null}

      {applications.length > 0 ? (
        <section className="space-y-5">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <CardTitle>{application.job.title}</CardTitle>
                    <CardDescription>
                      {application.job.company.name} / Applied{" "}
                      {formatDate(application.appliedAt)}
                    </CardDescription>
                  </div>
                  <Badge variant={statusVariants[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <StatusTimeline status={application.status} />
                {application.status === ApplicationStatus.INTERVIEW &&
                application.interviews.length > 0 ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <h3 className="text-sm font-semibold text-dark">
                      Interview details
                    </h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {application.interviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="rounded-lg bg-white p-3 text-sm text-muted"
                        >
                          <p className="font-semibold text-dark">
                            {interview.title}
                          </p>
                          <p className="mt-1">
                            {formatDateTime(interview.scheduledAt)}
                          </p>
                          <p className="mt-1">
                            {interview.mode} / {interview.durationMins} mins
                          </p>
                          {interview.meetingUrl ? (
                            <a
                              href={interview.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex font-semibold text-primary hover:text-primary-dark"
                            >
                              Join meeting
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No applications yet"
          description="Start browsing open jobs and submit your first HireHub application."
          action={
            <Link
              href="/jobs"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Browse Jobs
            </Link>
          }
        />
      )}
    </>
  );
}

function StatusTimeline({ status }: { status: ApplicationStatus }) {
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {statusOrder.map((item, index) => {
        const isReached =
          status === ApplicationStatus.REJECTED
            ? item === ApplicationStatus.REJECTED || index <= currentIndex
            : index <= currentIndex && item !== ApplicationStatus.REJECTED;

        return (
          <div
            key={item}
            className={
              isReached
                ? "rounded-xl bg-blue-50 px-3 py-2 text-center text-xs font-semibold text-primary"
                : "rounded-xl bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-500"
            }
          >
            {statusLabels[item]}
          </div>
        );
      })}
    </div>
  );
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
