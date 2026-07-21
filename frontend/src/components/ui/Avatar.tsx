import { HTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/shared/lib/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  showOnline?: boolean;
  isOnline?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-2xs",
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-10 w-10 text-sm",
  xl: "h-12 w-12 text-base",
};

const onlineDotSize: Record<AvatarSize, string> = {
  xs: "h-2 w-2 border",
  sm: "h-2.5 w-2.5 border-[1.5px]",
  md: "h-3 w-3 border-2",
  lg: "h-3 w-3 border-2",
  xl: "h-3.5 w-3.5 border-2",
};

// Deterministic color from name string
const colorPalette = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
];

function getColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, src, size = "md", showOnline, isOnline, className, ...props }, ref) => {
    const [imgError, setImgError] = useState(false);
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);
    const showImage = src && !imgError;

    return (
      <div ref={ref} className={cn("relative inline-flex shrink-0", className)} {...props}>
        {showImage ? (
          <img
            src={src ?? undefined}
            alt={name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className={cn("rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10", sizeClasses[size])}
          />
        ) : (
          <div
            role="img"
            aria-label={name}
            className={cn(
              "flex items-center justify-center rounded-full font-medium ring-1 ring-black/5 select-none dark:ring-white/10",
              sizeClasses[size],
              bgColor
            )}
          >
            {initials}
          </div>
        )}
        {showOnline && (
          <span
            aria-label={isOnline ? "Online" : "Offline"}
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-background",
              onlineDotSize[size],
              isOnline ? "bg-success" : "bg-muted-foreground/40"
            )}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

interface AvatarGroupProps {
  members: { name: string; src?: string | null }[];
  size?: AvatarSize;
  max?: number;
  className?: string;
}

/** Overlapping cluster of avatars with a "+N" overflow chip. */
export function AvatarGroup({ members, size = "sm", max = 4, className }: AvatarGroupProps) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {shown.map((m, i) => (
        <Avatar
          key={`${m.name}-${i}`}
          name={m.name}
          src={m.src}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {extra > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
            sizeClasses[size]
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
