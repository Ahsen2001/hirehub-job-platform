import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Overview", href: "#", active: true, marker: "O" },
  { label: "Job Posts", href: "#", marker: "J" },
  { label: "Applications", href: "#", marker: "A", count: 18 },
  { label: "Candidates", href: "#", marker: "C" },
  { label: "Interviews", href: "#", marker: "I" },
  { label: "Messages", href: "#", marker: "M", count: 4 },
  { label: "Settings", href: "#", marker: "S" },
];

export function DashboardSidebar() {
  return (
    <aside className="w-full rounded-card border border-border bg-white p-3 shadow-card lg:sticky lg:top-24 lg:w-72 lg:self-start">
      <div className="border-b border-border px-3 pb-4">
        <p className="text-xs font-semibold uppercase text-muted">
          Employer Dashboard
        </p>
        <h2 className="mt-1 text-lg font-bold text-dark">HireHub Team</h2>
      </div>

      <nav className="mt-3 grid gap-1" aria-label="Dashboard">
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              item.active
                ? "bg-blue-50 text-primary"
                : "text-slate-600 hover:bg-slate-50 hover:text-dark",
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg text-xs font-bold",
                  item.active
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {item.marker}
              </span>
              {item.label}
            </span>
            {item.count ? <Badge variant="primary">{item.count}</Badge> : null}
          </Link>
        ))}
      </nav>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-dark">Hiring plan</p>
        <p className="mt-1 text-xs leading-5 text-muted">
          8 active roles and 42 candidates in review.
        </p>
      </div>
    </aside>
  );
}
