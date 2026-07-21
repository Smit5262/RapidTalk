import { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface Props {
  value: string;
}

const RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "A number", test: (v: string) => /[0-9]/.test(v) },
];

const LEVELS = [
  { label: "Weak", color: "bg-destructive", text: "text-destructive" },
  { label: "Fair", color: "bg-warning", text: "text-warning" },
  { label: "Strong", color: "bg-success", text: "text-success" },
];

/** Live password requirement checklist with a strength meter. */
export function PasswordStrength({ value }: Props) {
  const passed = useMemo(() => RULES.map((r) => r.test(value)), [value]);
  const score = passed.filter(Boolean).length;

  if (!value) return null;

  const level = LEVELS[Math.max(0, score - 1)] ?? LEVELS[0];

  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {LEVELS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i < score ? level.color : "bg-muted"
              )}
            />
          ))}
        </div>
        <span className={cn("text-2xs font-medium", level.text)}>{level.label}</span>
      </div>
      <ul className="grid gap-1">
        {RULES.map((rule, i) => (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              passed[i] ? "text-success" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-3.5 w-3.5 items-center justify-center rounded-full",
                passed[i] ? "bg-success/15" : "bg-muted"
              )}
            >
              {passed[i] && <Check size={9} strokeWidth={3} />}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
