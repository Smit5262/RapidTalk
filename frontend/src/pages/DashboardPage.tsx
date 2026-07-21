import { useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  MessageSquare,
  Users,
  FileText,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  useDashboardOverview,
  useDashboardActivity,
  useDashboardRecent,
} from "@/features/dashboard/useDashboard";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/shared/lib/cn";

const TINTS = {
  indigo: {
    surface: "from-indigo-500/[0.08] to-violet-500/[0.04]",
    badge: "bg-gradient-to-br from-indigo-500 to-violet-600",
    glow: "bg-indigo-500/20",
    ring: "hover:border-indigo-500/40",
  },
  blue: {
    surface: "from-blue-500/[0.08] to-cyan-500/[0.04]",
    badge: "bg-gradient-to-br from-blue-500 to-cyan-500",
    glow: "bg-blue-500/20",
    ring: "hover:border-blue-500/40",
  },
  emerald: {
    surface: "from-emerald-500/[0.08] to-teal-500/[0.04]",
    badge: "bg-gradient-to-br from-emerald-500 to-teal-500",
    glow: "bg-emerald-500/20",
    ring: "hover:border-emerald-500/40",
  },
  amber: {
    surface: "from-amber-500/[0.10] to-orange-500/[0.04]",
    badge: "bg-gradient-to-br from-amber-500 to-orange-500",
    glow: "bg-amber-500/20",
    ring: "hover:border-amber-500/40",
  },
  violet: {
    surface: "from-violet-500/[0.09] to-fuchsia-500/[0.04]",
    badge: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    glow: "bg-violet-500/20",
    ring: "hover:border-violet-500/40",
  },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: number | string;
  tint: keyof typeof TINTS;
}) {
  const t = TINTS[tint];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        t.ring
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", t.surface)} />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60",
          t.glow
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105",
            t.badge
          )}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">
        {payload[0].value} {payload[0].value === 1 ? "message" : "messages"}
      </p>
    </div>
  );
}

function ActivityChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date: date.slice(5), count }));

  if (entries.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
        No activity data yet.
      </div>
    );
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={entries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#activityFill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatMetadata(metadata?: Record<string, unknown>) {
  if (!metadata || Object.keys(metadata).length === 0) return null;
  return Object.entries(metadata)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" · ");
}

function RecentEvents({
  events,
}: {
  events: Array<{
    id: string;
    action: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
  }>;
}) {
  if (events.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No recent events.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {events.map((e) => {
        const meta = formatMetadata(e.metadata);
        return (
          <div
            key={e.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Clock size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium capitalize">
                {e.action.replace(/_/g, " ").toLowerCase()}
              </p>
              {meta && (
                <p className="truncate text-xs text-muted-foreground">{meta}</p>
              )}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {new Date(e.createdAt).toLocaleDateString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview(
    workspaceId ?? null
  );
  const { data: activity, isLoading: activityLoading } = useDashboardActivity(
    workspaceId ?? null
  );
  const { data: recent, isLoading: recentLoading } = useDashboardRecent(
    workspaceId ?? null
  );

  if (overviewLoading || activityLoading || recentLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-sm shadow-primary/25">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your workspace activity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <TrendingUp size={13} />
          Last 30 days
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={MessageSquare}
          label="Messages sent"
          value={overview?.messagesSent ?? 0}
          tint="indigo"
        />
        <StatCard
          icon={Users}
          label="Active users (7d)"
          value={overview?.activeUsers ?? 0}
          tint="blue"
        />
        <StatCard
          icon={FileText}
          label="Files shared"
          value={overview?.filesShared ?? 0}
          tint="emerald"
        />
        <StatCard
          icon={BarChart3}
          label="Channels"
          value={overview?.channelCount ?? 0}
          tint="amber"
        />
        <StatCard
          icon={Sparkles}
          label="AI requests"
          value={overview?.aiUsageCount ?? 0}
          tint="violet"
        />
      </div>

      {/* Activity chart */}
      <div className="surface-card rounded-2xl border border-border/70 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
              <TrendingUp size={15} />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Messages per day</h2>
              <p className="text-xs text-muted-foreground">Daily message volume</p>
            </div>
          </div>
          <span className="rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
            Last 30 days
          </span>
        </div>
        <ActivityChart data={activity?.dailyCounts ?? {}} />
      </div>

      {/* Recent activity */}
      <div className="surface-card rounded-2xl border border-border/70 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <Clock size={15} />
          </span>
          <h2 className="text-sm font-semibold">Recent activity</h2>
        </div>
        <RecentEvents events={recent ?? []} />
      </div>
    </div>
  );
}
