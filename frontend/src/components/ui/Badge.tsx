import { HTMLAttributes, forwardRef, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border border-border text-muted-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-2xs",
        md: "px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const dotColor: Record<string, string> = {
  default: "bg-primary",
  secondary: "bg-secondary-foreground",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  outline: "bg-muted-foreground",
};

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
  /** Render a leading status dot in the variant's color. */
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, size, className }))} {...props}>
        {dot && (
          <span
            aria-hidden
            className={cn("h-1.5 w-1.5 rounded-full", dotColor[variant ?? "default"])}
          />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
