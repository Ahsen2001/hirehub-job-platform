import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getJobById, jobs } from "@/data/jobs";

type JobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    return {
      title: "Job not found | HireHub",
    };
  }

  return {
    title: `${job.title} at ${job.company} | HireHub`,
    description: job.description,
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    notFound();
  }

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
              <Badge variant="primary">{job.category}</Badge>
              <h1 className="mt-4 text-3xl font-bold text-dark sm:text-4xl">
                {job.title}
              </h1>
              <p className="mt-2 text-base font-medium text-muted">
                {job.company}
              </p>
            </div>
            <Button size="lg">Apply now</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job description</CardTitle>
              <CardDescription>
                Role overview and day-to-day responsibilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted">{job.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                What the hiring team is looking for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.requirements.map((requirement) => (
                  <li
                    key={requirement}
                    className="flex gap-3 text-sm leading-6 text-muted"
                  >
                    <span className="mt-2 size-2 rounded-full bg-primary" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Job summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SummaryItem label="Company" value={job.company} />
              <SummaryItem label="Location" value={job.location} />
              <SummaryItem label="Salary" value={job.salary} />
              <SummaryItem label="Job type" value={job.type} />
              <SummaryItem label="Posted" value={job.postedAt} />
              <Button className="w-full" size="lg">
                Apply for this role
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </MainLayout>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
};

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-dark">{value}</p>
    </div>
  );
}
