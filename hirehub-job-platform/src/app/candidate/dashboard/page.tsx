import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationStatus, JobStatus } from "@/generated/prisma/client";
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
  title: "Candidate Dashboard | HireHub",
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

export default async function CandidateDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const prisma = getPrisma();

  const [
    profile,
    totalApplications,
    applicationsByStatus,
    recentApplications,
    appliedJobs,
  ] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId: user.id },
        include: {
          skills: true,
          education: true,
          workExperience: true,
        },
      }),
      prisma.application.count({
        where: { candidateId: user.id },
      }),
      prisma.application.groupBy({
        by: ["status"],
        where: { candidateId: user.id },
        _count: { status: true },
      }),
      prisma.application.findMany({
        where: { candidateId: user.id },
        orderBy: { appliedAt: "desc" },
        take: 5,
        include: {
          job: {
            include: {
              company: true,
            },
          },
        },
      }),
      prisma.application.findMany({
        where: { candidateId: user.id },
        select: { jobId: true },
      }),
    ]);

  const appliedJobIds = appliedJobs.map((application) => application.jobId);
  const recommendedJobs = await prisma.job.findMany({
    where: {
      status: JobStatus.OPEN,
      id: appliedJobIds.length > 0 ? { notIn: appliedJobIds } : undefined,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 4,
    include: {
      company: true,
      category: true,
    },
  });

  const statusCounts = new Map(
    applicationsByStatus.map((item) => [item.status, item._count.status]),
  );
  const profileCompletion = getProfileCompletion(profile);
  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
    : user.name;

  return (
    <>
      <DashboardPageHeader
        title={`Welcome back, ${displayName}`}
        description="Track your profile, applications, interviews, and recommended opportunities from your HireHub workspace."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <QuickAction href="/candidate/profile">Complete Profile</QuickAction>
            <QuickAction href="/candidate/jobs">Browse Jobs</QuickAction>
            <QuickAction href="/candidate/applications">
              View Applications
            </QuickAction>
          </div>
        }
      />

      <section className="grid gap-5 lg:grid-cols-3">
        <ProfileCompletionCard percentage={profileCompletion} />
        <MetricCard label="Total applications" value={totalApplications} />
        <CvStatusCard resumeUrl={profile?.resumeUrl} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Applications by status</CardTitle>
            <CardDescription>
              A quick look at where your applications stand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {applicationStatuses.map((status) => {
              const count = statusCounts.get(status) ?? 0;
              return (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariants[status]}>
                      {statusLabels[status]}
                    </Badge>
                    <span className="text-sm font-medium text-muted">
                      {getStatusHelperText(status)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-dark">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent applications</CardTitle>
            <CardDescription>
              Your latest application activity from the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <article
                    key={application.id}
                    className="rounded-xl border border-border bg-slate-50 p-4 transition-colors hover:border-blue-200 hover:bg-white"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-semibold text-dark">
                          {application.job.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {application.job.company.name} /{" "}
                          {application.job.location}
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
                description="Browse open jobs and submit your first HireHub application."
                action={<QuickAction href="/candidate/jobs">Browse Jobs</QuickAction>}
                className="shadow-none"
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recommended jobs</CardTitle>
            <CardDescription>
              Open roles suggested from current HireHub job data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedJobs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {recommendedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.slug}`}
                    className="rounded-xl border border-border bg-slate-50 p-4 transition-all duration-200 hover:border-blue-200 hover:bg-white hover:shadow-card"
                  >
                    <Badge variant={job.isFeatured ? "primary" : "outline"}>
                      {job.category?.name ?? "General"}
                    </Badge>
                    <h3 className="mt-3 font-semibold text-dark">{job.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {job.company.name}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      {job.location} / {formatSalary(job)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recommended jobs"
                description="New open roles will appear here after recruiters publish jobs."
                className="shadow-none"
              />
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{value}</CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function ProfileCompletionCard({ percentage }: { percentage: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{percentage}%</CardTitle>
        <CardDescription>Profile completion</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-3 rounded-full bg-slate-100">
          <div
            className="h-3 rounded-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CvStatusCard({ resumeUrl }: { resumeUrl?: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">
          {resumeUrl ? "Uploaded" : "Missing"}
        </CardTitle>
        <CardDescription>CV upload status</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant={resumeUrl ? "success" : "warning"}>
          {resumeUrl ? "Ready for applications" : "Upload your CV"}
        </Badge>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
    >
      {children}
    </Link>
  );
}

function getProfileCompletion(
  profile:
    | {
        firstName: string;
        lastName: string;
        phone: string | null;
        headline: string | null;
        bio: string | null;
        location: string | null;
        resumeUrl: string | null;
        skills: unknown[];
        education: unknown[];
        workExperience: unknown[];
      }
    | null,
) {
  if (!profile) {
    return 0;
  }

  const checks = [
    profile.firstName,
    profile.lastName,
    profile.phone,
    profile.headline,
    profile.bio,
    profile.location,
    profile.resumeUrl,
    profile.skills.length > 0,
    profile.education.length > 0,
    profile.workExperience.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function getStatusHelperText(status: ApplicationStatus) {
  const helperText: Record<ApplicationStatus, string> = {
    APPLIED: "Submitted",
    SHORTLISTED: "Recruiter review",
    INTERVIEW: "Interview stage",
    OFFERED: "Offer received",
    REJECTED: "Closed",
  };

  return helperText[status];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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
