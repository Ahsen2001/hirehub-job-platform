import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "slate"
  | "outline";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  primary: "bg-blue-50 text-primary ring-blue-100",
  success: "bg-green-50 text-success ring-green-100",
  warning: "bg-amber-50 text-warning ring-amber-100",
  danger: "bg-red-50 text-danger ring-red-100",
  slate: "bg-slate-100 text-dark ring-slate-200",
  outline: "bg-white text-slate-600 ring-border",
};

export function Badge({ className, variant = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
