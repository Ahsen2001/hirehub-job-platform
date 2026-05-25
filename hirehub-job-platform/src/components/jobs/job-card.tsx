import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Job } from "@/data/jobs";

type JobCardProps = {
  job: Job;
};

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.company}</CardDescription>
          </div>
          {job.featured ? <Badge variant="primary">Featured</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm leading-6 text-muted">
          {job.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{job.location}</Badge>
          <Badge variant="outline">{job.type}</Badge>
          <Badge variant="outline">{job.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-dark">{job.salary}</p>
          <p className="text-xs text-muted">{job.postedAt}</p>
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View job
        </Link>
      </CardFooter>
    </Card>
  );
}
