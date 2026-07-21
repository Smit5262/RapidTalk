import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/shared/lib/cn";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Compact inline variant for use inside cards/panels. */
  compact?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  compact,
  className,
}: Props) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        compact ? "py-10" : "py-16",
        className
      )}
    >
      <div className="relative mb-5">
        <div aria-hidden className="absolute inset-0 -z-10 rounded-2xl bg-destructive/15 blur-xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-gradient-to-b from-destructive/10 to-destructive/5 text-destructive shadow-sm">
          <AlertTriangle size={22} aria-hidden />
        </div>
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {message && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground text-balance">
          {message}
        </p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5 gap-1.5" onClick={onRetry}>
          <RefreshCw size={14} />
          Try again
        </Button>
      )}
    </div>
  );
}
