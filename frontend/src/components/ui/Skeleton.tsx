import { cn } from "@/shared/lib/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-muted/70", className)}>
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-2">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2 py-0.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/** A run of message skeletons for channel-history loading. */
export function MessageListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading messages" className="flex flex-col gap-1 py-4">
      <span className="sr-only">Loading messages</span>
      {Array.from({ length: rows }).map((_, i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChannelSkeleton() {
  return (
    <div role="status" aria-label="Loading channels" className="flex flex-col gap-1 px-2">
      <span className="sr-only">Loading channels</span>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-8 rounded-lg" />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return <Skeleton className="h-[104px] rounded-xl" />;
}

export function DashboardChartSkeleton() {
  return <Skeleton className="h-72 rounded-xl" />;
}
