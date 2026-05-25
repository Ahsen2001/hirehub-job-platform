import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function JobDetailLoading() {
  return (
    <MainLayout>
      <section className="border-b border-border bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-10 w-full max-w-xl animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-5 w-64 animate-pulse rounded bg-slate-100" />
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        {[0, 1].map((item) => (
          <Card key={item}>
            <CardHeader>
              <div className="h-6 w-44 animate-pulse rounded bg-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="h-32 animate-pulse rounded bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </section>
    </MainLayout>
  );
}
