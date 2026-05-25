import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center rounded-card border border-dashed border-slate-300 bg-white p-8 text-center shadow-card",
        className,
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-blue-50 text-primary">
        <span className="text-xl font-bold">+</span>
      </div>
      <h3 className="text-base font-semibold text-dark">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
