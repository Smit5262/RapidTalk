import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={props.id}>
        {label}
      </label>
      <input
        ref={ref}
        className={clsx(
          "rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  ),
);
FormField.displayName = "FormField";