import Link from "next/link";
import { JobType } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type JobCardProps = {
  job: {
    slug: string;
    title: string;
    description: string;
    location: string;
    type: JobType;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string;
    isFeatured: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    company: {
      name: string;
    };
    category: {
      name: string;
    } | null;
  };
};

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  REMOTE: "Remote",
};

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.company.name}</CardDescription>
          </div>
          {job.isFeatured ? <Badge variant="primary">Featured</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm leading-6 text-muted">
          {job.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{job.location}</Badge>
          <Badge variant="outline">{jobTypeLabels[job.type]}</Badge>
          <Badge variant="outline">{job.category?.name ?? "General"}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-dark">{formatSalary(job)}</p>
          <p className="text-xs text-muted">
            Posted {formatDate(job.publishedAt ?? job.createdAt)}
          </p>
        </div>
        <Link
          href={`/jobs/${job.slug}`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View job
        </Link>
      </CardFooter>
    </Card>
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
