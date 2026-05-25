import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CandidateApplicationsLoading() {
  return (
    <div className="space-y-5">
      <div className="rounded-card border border-border bg-white p-5 shadow-card">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
      </div>
      {[0, 1, 2].map((item) => (
        <Card key={item}>
          <CardHeader>
            <div className="h-6 w-56 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
          </CardHeader>
          <CardContent>
            <div className="h-16 animate-pulse rounded bg-slate-100" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
