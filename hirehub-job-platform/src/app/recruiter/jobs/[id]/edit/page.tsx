import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { updateJob } from "@/app/recruiter/jobs/actions";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";
import { RecruiterJobForm } from "@/components/recruiter/job-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Job | HireHub",
};

type RecruiterEditJobPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecruiterEditJobPage({
  params,
}: RecruiterEditJobPageProps) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "RECRUITER") {
    redirect("/unauthorized");
  }

  const prisma = getPrisma();
  const job = await prisma.job.findFirst({
    where: { id, recruiterId: user.id },
    include: {
      company: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });

  if (!job) {
    notFound();
  }

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
        title="Edit Job"
        description="Update the job post details, visibility, salary, and candidate requirements."
      />

      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>
            Changes are saved securely with recruiter ownership checks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecruiterJobForm
            action={updateJob}
            categories={categories}
            companies={companies}
            defaults={{
              id: job.id,
              title: job.title,
              description: job.description,
              requirements: job.requirements.join("\n"),
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              salaryCurrency: job.salaryCurrency,
              location: job.location,
              type: job.type,
              categoryId: job.categoryId,
              companyId: job.companyId,
              status: job.status,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </>
  );
}
