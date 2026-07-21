import { InputHTMLAttributes, forwardRef, ReactNode, useId, useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  /** Content rendered at the trailing edge of the input (e.g. a clear button). */
  trailing?: ReactNode;
  /** Render an eye toggle to reveal/hide the value. Implies type="password". */
  revealable?: boolean;
  /** Show a required asterisk next to the label. */
  requiredMark?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FieldProps>(
  (
    { label, error, hint, icon, trailing, revealable, requiredMark, className, id, type, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const [revealed, setRevealed] = useState(false);

    const resolvedType = revealable ? (revealed ? "text" : "password") : type;
    const hasTrailing = Boolean(trailing) || revealable;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1 text-sm font-medium text-foreground" htmlFor={inputId}>
          {label}
          {requiredMark && (
            <span className="text-destructive" aria-hidden>
              *
            </span>
          )}
        </label>
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-errormessage={error ? errorId : undefined}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-all duration-150",
              "placeholder:text-muted-foreground/70",
              "hover:border-muted-foreground/30",
              "focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              icon && "pl-9",
              hasTrailing && "pr-10",
              className
            )}
            {...props}
          />
          {revealable ? (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              tabIndex={-1}
              aria-label={revealed ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : (
            trailing && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">{trailing}</div>
            )
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-destructive"
          >
            <AlertCircle size={13} className="shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";
