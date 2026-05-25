import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";

const stats = [
  { label: "Open roles", value: "08", trend: "+2 this week" },
  { label: "Applications", value: "126", trend: "+18 new" },
  { label: "Interviews", value: "14", trend: "6 scheduled" },
  { label: "Offer rate", value: "28%", trend: "+4.2%" },
];

const jobs = [
  {
    title: "Senior Frontend Engineer",
    location: "Remote",
    type: "Full-time",
    applicants: 34,
    status: "Active",
  },
  {
    title: "Product Designer",
    location: "Colombo",
    type: "Hybrid",
    applicants: 21,
    status: "Review",
  },
  {
    title: "Talent Acquisition Lead",
    location: "Singapore",
    type: "Full-time",
    applicants: 17,
    status: "Closing soon",
  },
];

const candidates = [
  {
    name: "Nadia Perera",
    role: "Senior Frontend Engineer",
    stage: "Interview",
    score: "92%",
  },
  {
    name: "Arun Silva",
    role: "Product Designer",
    stage: "Shortlisted",
    score: "88%",
  },
  {
    name: "Maya Chen",
    role: "Talent Acquisition Lead",
    stage: "Screening",
    score: "81%",
  },
];

export default function Home() {
  return (
    <MainLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 space-y-6">
          <section className="flex flex-col justify-between gap-4 rounded-card border border-border bg-white px-5 py-5 shadow-card sm:flex-row sm:items-center">
            <div>
              <Badge variant="primary">Hiring dashboard</Badge>
              <h1 className="mt-3 text-2xl font-bold text-dark sm:text-3xl">
                HireHub Job Application Platform
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Track job posts, review candidates, and keep hiring decisions
                moving from one responsive workspace.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline">Import CVs</Button>
              <Button>Post new role</Button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="pb-3">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-3xl">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="success">{stat.trend}</Badge>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Active job posts</CardTitle>
                  <CardDescription>
                    Current roles accepting applications.
                  </CardDescription>
                </div>
                <Button variant="ghost">View all</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobs.map((job) => (
                  <article
                    key={job.title}
                    className="rounded-xl border border-border bg-slate-50 p-4 transition-all duration-200 hover:border-blue-200 hover:bg-white hover:shadow-card"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-dark">{job.title}</h3>
                        <p className="mt-1 text-sm text-muted">
                          {job.location} · {job.type}
                        </p>
                      </div>
                      <Badge
                        variant={
                          job.status === "Active"
                            ? "success"
                            : job.status === "Review"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-600">
                        {job.applicants} applicants
                      </span>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </article>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review queue</CardTitle>
                <CardDescription>
                  Candidate profiles needing a decision.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-dark">
                        {candidate.name}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {candidate.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{candidate.stage}</Badge>
                      <p className="mt-1 text-xs font-semibold text-success">
                        {candidate.score}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="secondary">
                  Open candidate pipeline
                </Button>
              </CardFooter>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <EmptyState
              title="No archived roles"
              description="Closed hiring rounds will appear here once a role is archived."
              action={<Button variant="outline">Create archive</Button>}
            />
            <Loading label="Syncing latest applications" />
            <ErrorState
              title="CV upload paused"
              message="Supabase Storage credentials are not configured yet."
              action={<Button variant="danger">Check settings</Button>}
            />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
