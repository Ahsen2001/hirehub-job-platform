import { cn } from "@/lib/utils";

type LoadingProps = {
  label?: string;
  className?: string;
};

export function Loading({ label = "Loading", className }: LoadingProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 rounded-card border border-border bg-white p-6 text-center shadow-card",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="size-9 animate-spin rounded-full border-4 border-blue-100 border-t-primary" />
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}
