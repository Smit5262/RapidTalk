import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type AlertVariant = "error" | "success" | "info";

const variantStyles: Record<AlertVariant, string> = {
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  success: "border-success/20 bg-success/10 text-success",
  info: "border-primary/20 bg-primary/5 text-foreground",
};

const icons: Record<AlertVariant, typeof AlertCircle> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

/** Compact inline alert banner with screen-reader announcement. */
export function Alert({ variant = "error", children, className }: AlertProps) {
  const Icon = icons[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
        variantStyles[variant],
        className
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}
