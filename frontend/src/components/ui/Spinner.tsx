import { cn } from "@/shared/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Accessible label announced to screen readers. */
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-6 w-6 border-[2.5px]",
};

/**
 * Minimal indeterminate spinner. Inherits `currentColor` so it adapts to the
 * surface it sits on; pass a text color via `className` to override.
 */
export function Spinner({ size = "md", className, label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent text-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Full-height centered loader used for route/page-level suspense fallbacks so
 * every screen shares one consistent loading treatment.
 */
export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] h-full w-full flex-col items-center justify-center gap-3">
      <Spinner size="lg" label={label} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
