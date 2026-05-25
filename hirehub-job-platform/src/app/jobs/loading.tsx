import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function JobsLoading() {
  return (
    <MainLayout>
      <section className="border-b border-border bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-10 w-full max-w-lg animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-24 animate-pulse rounded-card bg-white shadow-card" />
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Card key={item}>
              <CardHeader>
                <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
              </CardHeader>
              <CardContent>
                <div className="h-20 animate-pulse rounded bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
