import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export default function CandidateDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-white p-5 shadow-card">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
      </div>
      <section className="grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item}>
            <CardHeader>
              <div className="h-8 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <Card key={item}>
            <CardHeader>
              <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
