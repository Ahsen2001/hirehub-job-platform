import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { JobStatus, JobType } from "@/generated/prisma/client";
import { ApplyForm } from "@/components/candidate/apply-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

type ApplyPageProps = {
  params: Promise<{ jobId: string }>;
};

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  REMOTE: "Remote",
};

export const metadata: Metadata = {
  title: "Apply | HireHub",
};

export default async function CandidateApplyPage({ params }: ApplyPageProps) {
  const [{ jobId }, user] = await Promise.all([params, getCurrentUser()]);

  if (!user) {
    redirect(`/login?redirect=/candidate/apply/${jobId}`);
  }

  if (user.role !== "CANDIDATE") {
    redirect("/unauthorized");
  }

  const prisma = getPrisma();
  const job = await prisma.job.findFirst({
    where: { id: jobId, status: JobStatus.OPEN },
    include: {
      company: true,
      category: true,
    },
  });

  if (!job) {
    notFound();
  }

  const [profile, existingApplication] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        skills: { orderBy: { name: "asc" } },
        education: true,
        workExperience: true,
      },
    }),
    prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: job.id,
          candidateId: user.id,
        },
      },
      select: { id: true },
    }),
  ]);

  return (
    <>
      <DashboardPageHeader
        title={`Apply for ${job.title}`}
        description={`Review your profile and submit your application to ${job.company.name}.`}
        action={
          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary"
          >
            View job
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected job</CardTitle>
              <CardDescription>{job.company.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">{job.category?.name ?? "General"}</Badge>
                <Badge variant="outline">{jobTypeLabels[job.type]}</Badge>
                <Badge variant="outline">{job.location}</Badge>
              </div>
              <p className="text-sm leading-7 text-muted">{job.description}</p>
              <p className="text-sm font-semibold text-dark">
                {formatSalary(job)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Candidate profile summary</CardTitle>
              <CardDescription>
                This is the profile recruiters will review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted">
              <SummaryRow label="Name" value={profileName(profile, user.name)} />
              <SummaryRow label="Phone" value={profile?.phone ?? "Not added"} />
              <SummaryRow
                label="Address"
                value={profile?.address ?? "Not added"}
              />
              <SummaryRow
                label="CV"
                value={profile?.resumeUrl ? "Uploaded" : "Missing"}
              />
              <div>
                <p className="text-xs font-semibold uppercase text-muted">
                  Skills
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile?.skills.length ? (
                    profile.skills.map((skill) => (
                      <Badge key={skill.id} variant="outline">
                        {skill.name}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="warning">No skills added</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application form</CardTitle>
            <CardDescription>
              Use your existing CV or upload a new one for this application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplyForm
              jobId={job.id}
              resumeUrl={profile?.resumeUrl ?? null}
              alreadyApplied={Boolean(existingApplication)}
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 font-semibold text-dark">{value}</p>
    </div>
  );
}

function profileName(
  profile: { firstName: string; lastName: string } | null,
  fallback: string,
) {
  if (!profile) {
    return fallback;
  }

  return [profile.firstName, profile.lastName].filter(Boolean).join(" ");
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
