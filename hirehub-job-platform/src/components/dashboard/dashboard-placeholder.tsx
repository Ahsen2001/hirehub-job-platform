import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardPlaceholderProps = {
  title: string;
  description: string;
  metrics?: Array<{ label: string; value: string }>;
};

export function DashboardPlaceholder({
  title,
  description,
  metrics = [],
}: DashboardPlaceholderProps) {
  return (
    <>
      <DashboardPageHeader title={title} description={description} />
      {metrics.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-3">
          {metrics.map((metric) => (
            <DashboardMetric
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </section>
      ) : null}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Workspace preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted">
            This page is wired into the protected dashboard layout and ready for
            database-backed content.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
