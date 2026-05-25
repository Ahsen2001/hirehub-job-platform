import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CandidateApplyLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-white p-5 shadow-card">
        <div className="h-8 w-72 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
      </div>
      <section className="grid gap-6 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <Card key={item}>
            <CardHeader>
              <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="h-48 animate-pulse rounded bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
