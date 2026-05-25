import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-red-100 bg-white p-6 text-center shadow-card",
        className,
      )}
      role="alert"
    >
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-danger">
        <span className="text-lg font-bold">!</span>
      </div>
      <h3 className="text-base font-semibold text-dark">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {message}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
