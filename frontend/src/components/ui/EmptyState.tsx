import { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Secondary action rendered beside the primary one. */
  secondaryAction?: ReactNode;
  /** Compact variant with reduced padding for use inside cards/panels. */
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        compact ? "py-10" : "py-16",
        className
      )}
    >
      {icon && (
        <div className={cn("relative", compact ? "mb-4" : "mb-5")}>
          <div aria-hidden className="absolute inset-0 -z-10 rounded-2xl bg-primary/20 blur-xl" />
          <div
            className={cn(
              "gradient-primary-soft flex items-center justify-center rounded-2xl border border-primary/20 text-primary shadow-sm",
              compact ? "h-12 w-12" : "h-14 w-14"
            )}
          >
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground text-balance">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
