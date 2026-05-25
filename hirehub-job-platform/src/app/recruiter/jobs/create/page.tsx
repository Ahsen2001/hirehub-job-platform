import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createJob } from "@/app/recruiter/jobs/actions";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";
import { RecruiterJobForm } from "@/components/recruiter/job-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Create Job | HireHub",
};

export default async function RecruiterCreateJobPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "RECRUITER") {
    redirect("/unauthorized");
  }

  const prisma = getPrisma();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { recruiterCompanyId: true },
  });
  const [categories, companies] = await Promise.all([
    prisma.jobCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.company.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          ...(dbUser?.recruiterCompanyId
            ? [{ id: dbUser.recruiterCompanyId }]
            : []),
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <DashboardPageHeader
        title="Create Job"
        description="Publish a new role for candidates browsing HireHub."
      />

      {companies.length === 0 || categories.length === 0 ? (
        <EmptyState
          title="Setup required"
          description="You need at least one assigned company and one category before creating a job post."
          action={
            <Link
              href="/recruiter/jobs"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-dark hover:border-primary hover:text-primary"
            >
              Back to Jobs
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Job details</CardTitle>
            <CardDescription>
              Complete the fields candidates will see on the public job detail page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecruiterJobForm
              action={createJob}
              categories={categories}
              companies={companies}
              submitLabel="Create job"
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
