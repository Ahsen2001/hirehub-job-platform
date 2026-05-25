import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationStatus, Role } from "@/generated/prisma/client";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Dashboard | HireHub",
};

const applicationStatuses = [
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

export default async function AdminDashboardPage() {
  const prisma = getPrisma();

  const [
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalCompanies,
    totalCategories,
    totalJobs,
    totalApplications,
    totalInterviews,
    recentUsers,
    recentJobs,
    recentApplications,
    applicationsByStatus,
    recentActivityLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.CANDIDATE } }),
    prisma.user.count({ where: { role: Role.RECRUITER } }),
    prisma.company.count(),
    prisma.jobCategory.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.interview.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        recruiterCompany: {
          select: { name: true },
        },
      },
    }),
    prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        company: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.application.findMany({
      orderBy: { appliedAt: "desc" },
      take: 5,
      include: {
        candidate: {
          include: {
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        job: {
          include: {
            company: { select: { name: true } },
          },
        },
      },
    }),
    prisma.application.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        actor: {
          include: {
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    }),
  ]);

  const statusCounts = new Map(
    applicationsByStatus.map((item) => [item.status, item._count.status]),
  );

  return (
    <>
      <DashboardPageHeader
        title="Admin Dashboard"
        description="Monitor HireHub users, companies, jobs, applications, interviews, and platform activity from real database data."
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric label="Total users" value={formatNumber(totalUsers)} />
        <DashboardMetric
          label="Total candidates"
          value={formatNumber(totalCandidates)}
        />
        <DashboardMetric
          label="Total recruiters"
          value={formatNumber(totalRecruiters)}
        />
        <DashboardMetric
          label="Total companies"
          value={formatNumber(totalCompanies)}
        />
        <DashboardMetric
          label="Total job categories"
          value={formatNumber(totalCategories)}
        />
        <DashboardMetric label="Total jobs" value={formatNumber(totalJobs)} />
        <DashboardMetric
          label="Total applications"
          value={formatNumber(totalApplications)}
        />
        <DashboardMetric
          label="Total interviews"
          value={formatNumber(totalInterviews)}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <RecentUsersCard users={recentUsers} />
        <ApplicationStatusSummary
          totalApplications={totalApplications}
          statusCounts={statusCounts}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <RecentJobsCard jobs={recentJobs} />
        <RecentApplicationsCard applications={recentApplications} />
      </section>

      <section className="mt-6">
        <RecentActivityCard logs={recentActivityLogs} />
      </section>
    </>
  );
}

function RecentUsersCard({
  users,
}: {
  users: {
    id: string;
    email: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    profile: { firstName: string; lastName: string } | null;
    recruiterCompany: { name: string } | null;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <CardTitle>Recent users</CardTitle>
            <CardDescription>Newest accounts created on HireHub.</CardDescription>
          </div>
          <Link
            href="/admin/users"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <div className="space-y-3">
            {users.map((user) => (
              <article
                key={user.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-slate-50 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-dark">{getUserName(user)}</h3>
                  <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
                  {user.recruiterCompany ? (
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {user.recruiterCompany.name}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Badge variant={getRoleVariant(user.role)}>
                    {formatConstant(user.role)}
                  </Badge>
                  <Badge variant={user.isActive ? "success" : "slate"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No users yet"
            description="New admin, recruiter, and candidate accounts will appear here."
            className="shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationStatusSummary({
  totalApplications,
  statusCounts,
}: {
  totalApplications: number;
  statusCounts: Map<ApplicationStatus, number>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application status summary</CardTitle>
        <CardDescription>
          Distribution of all candidate applications by pipeline stage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalApplications > 0 ? (
          <div className="space-y-4">
            {applicationStatuses.map((status) => {
              const count = statusCounts.get(status) ?? 0;
              const percentage = Math.round((count / totalApplications) * 100);

              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Badge variant={statusVariants[status]}>
                      {statusLabels[status]}
                    </Badge>
                    <span className="text-sm font-bold text-dark">
                      {formatNumber(count)} / {percentage}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No applications yet"
            description="Application status data will appear once candidates apply to jobs."
            className="shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
}

function RecentJobsCard({
  jobs,
}: {
  jobs: {
    id: string;
    title: string;
    slug: string;
    status: string;
    type: string;
    location: string;
    createdAt: Date;
    company: { name: string };
    category: { name: string } | null;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent jobs</CardTitle>
        <CardDescription>Latest job posts created by recruiters.</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className="block rounded-xl border border-border bg-slate-50 p-4 transition-colors hover:border-blue-200 hover:bg-white"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-semibold text-dark">{job.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {job.company.name} / {job.location}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {job.category?.name ?? "Uncategorized"} /{" "}
                      {formatConstant(job.type)}
                    </p>
                  </div>
                  <Badge variant={job.status === "OPEN" ? "success" : "slate"}>
                    {formatConstant(job.status)}
                  </Badge>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  Created {formatDate(job.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No jobs yet"
            description="Recruiter job posts will appear here after they are created."
            className="shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
}

function RecentApplicationsCard({
  applications,
}: {
  applications: {
    id: string;
    status: ApplicationStatus;
    appliedAt: Date;
    candidate: {
      email: string;
      profile: { firstName: string; lastName: string } | null;
    };
    job: {
      title: string;
      company: { name: string };
    };
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent applications</CardTitle>
        <CardDescription>Latest candidate submissions across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((application) => (
              <article
                key={application.id}
                className="rounded-xl border border-border bg-slate-50 p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-semibold text-dark">
                      {getUserName(application.candidate)}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {application.job.title} / {application.job.company.name}
                    </p>
                  </div>
                  <Badge variant={statusVariants[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  Applied {formatDate(application.appliedAt)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No applications yet"
            description="Candidate applications will appear here once submitted."
            className="shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityCard({
  logs,
}: {
  logs: {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    createdAt: Date;
    actor: {
      email: string;
      profile: { firstName: string; lastName: string } | null;
    } | null;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity logs</CardTitle>
        <CardDescription>
          Latest tracked platform events from application, job, and interview flows.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {logs.map((log) => (
              <article
                key={log.id}
                className="rounded-xl border border-border bg-slate-50 p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-semibold text-dark">
                      {formatConstant(log.action)}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {log.entityType}
                      {log.entityId ? ` / ${log.entityId.slice(0, 8)}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline">{formatDate(log.createdAt)}</Badge>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">
                  Actor: {log.actor ? getUserName(log.actor) : "System"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No activity logs"
            description="Platform activity will appear here as users take actions."
            className="shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
}

function getUserName(user: {
  email: string;
  profile: { firstName: string; lastName: string } | null;
}) {
  return user.profile
    ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(" ")
    : user.email;
}

function getRoleVariant(role: Role) {
  const variants: Record<Role, "primary" | "success" | "warning"> = {
    ADMIN: "primary",
    RECRUITER: "warning",
    CANDIDATE: "success",
  };

  return variants[role];
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatConstant(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
