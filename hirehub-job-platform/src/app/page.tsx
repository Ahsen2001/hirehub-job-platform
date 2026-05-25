import Link from "next/link";
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
import { jobs } from "@/data/jobs";

const featuredJobs = jobs.filter((job) => job.featured).slice(0, 3);

const steps = [
  {
    title: "Create your profile",
    description: "Add your skills, experience, and CV once.",
  },
  {
    title: "Discover matched roles",
    description: "Search roles by title, location, category, and work type.",
  },
  {
    title: "Apply with confidence",
    description: "Track every application from submission to interview.",
  },
];

const stats = [
  { label: "Active jobs", value: "1,200+" },
  { label: "Hiring companies", value: "320+" },
  { label: "Applications tracked", value: "48k+" },
  { label: "Average review time", value: "3 days" },
];

export default function Home() {
  return (
    <MainLayout>
      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <Badge variant="primary" className="w-fit">
              Job search made clear
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-dark sm:text-5xl">
              Find your next role and manage every application in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
              HireHub connects candidates with trusted companies through a
              clean job portal built for fast search, simple applications, and
              transparent hiring progress.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/jobs"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                Browse jobs
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-white px-5 text-base font-semibold text-dark transition-colors hover:border-primary hover:text-primary"
              >
                Create account
              </Link>
            </div>
          </div>

          <Card className="self-center">
            <CardHeader>
              <CardTitle>Today&apos;s hiring snapshot</CardTitle>
              <CardDescription>
                Fresh opportunities from companies actively reviewing talent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-xl border border-border bg-slate-50 p-4 transition-all duration-200 hover:border-blue-200 hover:bg-white hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-dark">{job.title}</h2>
                      <p className="mt-1 text-sm text-muted">{job.company}</p>
                    </div>
                    <Badge variant="success">{job.type}</Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    {job.location} / {job.salary}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-card border border-border bg-white p-4 shadow-card">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
            <input
              aria-label="Search by job title or keyword"
              placeholder="Search by title, company, or keyword"
              className="h-12 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
            <input
              aria-label="Search by location"
              placeholder="Location"
              className="h-12 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
            <Link
              href="/jobs"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Search jobs
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <Badge variant="slate">Featured jobs</Badge>
            <h2 className="mt-3 text-2xl font-bold text-dark">
              Roles hiring right now
            </h2>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            View all jobs
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </div>
                  <Badge variant="primary">Featured</Badge>
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
                <Link
                  href="/jobs"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Browse jobs
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-card border border-border bg-white p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-3xl font-bold text-dark">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-5 rounded-card bg-dark p-6 text-white shadow-soft sm:flex-row sm:items-center lg:p-8">
          <div>
            <h2 className="text-2xl font-bold">Ready to move your career?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Create a HireHub profile and start applying to verified roles in
              minutes.
            </p>
          </div>
          <Button>Get started</Button>
        </div>
      </section>
    </MainLayout>
  );
}
