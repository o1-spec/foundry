import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Zap,
  Sparkles,
  Users,
  Compass,
  DollarSign,
  Star,
  Activity,
  Heart,
  Leaf,
  Smile,
  Shield,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCost } from "@/lib/utils";
import type { MissionStatus } from "@prisma/client";

interface MissionWithAgents {
  id:          string;
  title:       string;
  description: string;
  status:      MissionStatus;
  progress:    number;
  type:        string;
  createdAt:   Date;
  agents: {
    id:   string;
    name: string;
    role: string;
  }[];
}

async function getDashboardMetrics() {
  const [missions, totalAgents, totalRuntimeCalls, metricsSummary] = await Promise.all([
    db.mission.findMany({
      include: {
        agents: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.agent.count(),
    db.runtimeMetric.count(),
    db.runtimeMetric.aggregate({
      _sum: { estimatedSavings: true },
    }),
  ]);

  return {
    missions: missions as unknown as MissionWithAgents[],
    totalAgents,
    totalRuntimeCalls,
    estimatedSavings: metricsSummary._sum.estimatedSavings ?? 0,
  };
}

const statusConfig: Record<
  MissionStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING:   { label: "Queued",      bg: "bg-neutral-50",   text: "text-neutral-500", border: "border-neutral-200/50" },
  RUNNING:   { label: "Running",     bg: "bg-emerald-50",   text: "text-emerald-600", border: "border-emerald-200/50" },
  PAUSED:    { label: "Paused",      bg: "bg-amber-50",     text: "text-amber-600",   border: "border-amber-200/50" },
  COMPLETED: { label: "Completed",  bg: "bg-violet-50",    text: "text-violet-600",  border: "border-violet-200/50" },
  FAILED:    { label: "Failed",      bg: "bg-rose-50",      text: "text-rose-600",    border: "border-rose-200/50" },
  CANCELLED: { label: "Cancelled",   bg: "bg-neutral-50",   text: "text-neutral-500", border: "border-neutral-200/50" },
};

// Pastel card configurations for the mission cards grid
const cardStyles = [
  { icon: Sparkles, iconBg: "bg-amber-100 text-amber-600 border-amber-200/40" },
  { icon: Heart,    iconBg: "bg-pink-100 text-pink-600 border-pink-200/40" },
  { icon: Leaf,     iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200/40" },
  { icon: Shield,   iconBg: "bg-violet-100 text-violet-600 border-violet-200/40" },
];

export default async function DashboardPage() {
  const { missions, totalAgents, totalRuntimeCalls, estimatedSavings } = await getDashboardMetrics();

  // Metrics list to map at the bottom of the page
  const metricsList = [
    {
      label: "Total missions",
      value: missions.length,
      trend: "+2 this week",
      icon: Star,
      iconBg: "bg-pink-100 text-pink-600 border border-pink-200/50"
    },
    {
      label: "Active agents",
      value: totalAgents,
      trend: "Across all missions",
      icon: Users,
      iconBg: "bg-violet-100 text-violet-600 border border-violet-200/50"
    },
    {
      label: "Runtime calls",
      value: totalRuntimeCalls.toLocaleString(),
      trend: "+18% vs last week",
      icon: Zap,
      iconBg: "bg-emerald-100 text-emerald-600 border border-emerald-200/50"
    },
    {
      label: "Estimated savings",
      value: formatCost(estimatedSavings),
      trend: "From BTL Runtime",
      icon: DollarSign,
      iconBg: "bg-amber-100 text-amber-600 border border-amber-200/50"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto">
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 rounded-3xl border border-neutral-200/60 bg-white p-6 md:p-8 shadow-xs items-center relative overflow-hidden">
        {/* Soft layout background shapes */}
        <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-pink-100/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-violet-100/40 blur-3xl pointer-events-none" />

        {/* Hero content */}
        <div className="space-y-5 text-left z-10">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl lg:text-5xl leading-[1.12]">
            Design in the browser, <br />
            <span className="italic font-normal font-serif">openly</span>.
          </h1>
          <p className="max-w-lg text-sm text-neutral-500 leading-relaxed font-sans">
            Foundry is where AI agents plan, build, and deliver real results — together. Orchestrate and review execution graphs in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/missions/new">
              <Button className="bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-semibold px-5 shadow-lg shadow-neutral-900/5">
                <Zap className="mr-1.5 h-3.5 w-3.5" /> Start a mission
              </Button>
            </Link>
            <Link href="/missions">
              <Button variant="outline" className="border-neutral-300 bg-white/80 hover:bg-neutral-50 text-neutral-900 rounded-full text-xs font-semibold px-5">
                Explore templates
              </Button>
            </Link>
          </div>

          {/* Connected state */}
          <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-100/60 px-3.5 py-1.5 rounded-full border border-neutral-200/60 w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[10px] uppercase tracking-wider text-neutral-500">{totalAgents} AI agents ready to collaborate</span>
          </div>
        </div>

        {/* Visual decoration cluster (sticker bounding box concept) */}
        <div className="relative hidden md:flex h-[200px] w-full items-center justify-center select-none pointer-events-none">
          {/* Main center planet frame */}
          <div className="relative border border-dashed border-neutral-300 p-1.5 bg-neutral-100/10 rounded-2xl">
            <span className="absolute -top-1 -left-1 w-1 h-1 border border-neutral-400 bg-white" />
            <span className="absolute -top-1 -right-1 w-1 h-1 border border-neutral-400 bg-white" />
            <span className="absolute -bottom-1 -left-1 w-1 h-1 border border-neutral-400 bg-white" />
            <span className="absolute -bottom-1 -right-1 w-1 h-1 border border-neutral-400 bg-white" />
            <div className="w-16 h-16 rounded-xl bg-neutral-100/90 border border-neutral-200/80 flex items-center justify-center shadow-xs">
              <Bot className="h-7 w-7 text-neutral-700" />
            </div>
          </div>

          {/* Draggable-like outline stickers */}
          {/* Top Left: Donut badge */}
          <div className="absolute top-4 left-6 -rotate-6 border border-dashed border-neutral-300/80 p-1 bg-white rounded-full">
            <div className="w-8 h-8 rounded-full bg-amber-100/80 border border-amber-200/50 flex items-center justify-center text-xs">
              🍩
            </div>
          </div>

          {/* Top Right: Blue lightning spark */}
          <div className="absolute top-6 right-6 rotate-12 border border-dashed border-neutral-300/80 p-1 bg-white rounded-full">
            <div className="w-8 h-8 rounded-full bg-blue-100/80 border border-blue-200/50 flex items-center justify-center text-xs text-blue-500">
              ⚡
            </div>
          </div>

          {/* Bottom Left: Green Leaf */}
          <div className="absolute bottom-6 left-8 -rotate-12 border border-dashed border-neutral-300/80 p-1 bg-white rounded-full">
            <div className="w-8 h-8 rounded-full bg-emerald-100/80 border border-emerald-200/50 flex items-center justify-center text-xs text-emerald-600">
              🌱
            </div>
          </div>

          {/* Bottom Right: Popsicle */}
          <div className="absolute bottom-4 right-8 rotate-6 border border-dashed border-neutral-300/80 p-1 bg-white rounded-full">
            <div className="w-8 h-8 rounded-full bg-neutral-100/80 border border-neutral-200/50 flex items-center justify-center text-xs text-neutral-600">
              🍭
            </div>
          </div>
        </div>
      </div>

      {/* ─── Missions Section ────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Your missions</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Track live pipeline executions and progress states.</p>
          </div>
          <Link href="/missions" className="text-xs font-semibold text-(--color-primary) hover:underline flex items-center gap-1">
            View all missions <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {missions.length === 0 ? (
          <Card className="bg-white py-16 text-center border-dashed border-neutral-200/80 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center max-w-sm mx-auto p-4">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-neutral-900">No active missions</h3>
              <p className="mb-5 text-xs text-neutral-400 max-w-[280px]">
                Launch your first multi-agent team to begin generating product schemas and roadmaps.
              </p>
              <Link href="/missions/new">
                <Button size="sm" className="bg-black text-white hover:bg-neutral-800 rounded-full px-4 text-xs font-semibold">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Initialize Mission
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Cards Grid layout: Limit to 4 cards, responsive single row */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {missions.slice(0, 4).map((m, idx) => {
              const cfg = statusConfig[m.status] || statusConfig.PENDING;
              const style = cardStyles[idx % cardStyles.length];
              const Icon = style.icon;

              return (
                <Link key={m.id} href={`/missions/${m.id}`} className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left min-h-[190px]">
                  <div>
                    {/* Top Row: Pastel Icon Box and status badge */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${style.iconBg}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Title and description */}
                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-pink-500 transition-colors line-clamp-1">
                      {m.title}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  {/* Progress & Bottom telemetry details */}
                  <div className="mt-4 pt-3.5 border-t border-neutral-100 space-y-3">
                    {/* Progress details */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] uppercase tracking-wider font-bold text-neutral-400">
                        <span>Progress</span>
                        <span className="text-neutral-700">{m.progress}%</span>
                      </div>
                      {/* Pink progress bar matching style guide */}
                      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full bg-(--color-primary) rounded-full transition-all duration-500"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Assigned Agents Initials row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Agents</span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {m.agents.slice(0, 4).map((agent) => (
                          <div
                            key={agent.id}
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-[8px] font-bold text-pink-600 border border-white shrink-0"
                            title={`${agent.name} (${agent.role})`}
                          >
                            {agent.name[0]}
                          </div>
                        ))}
                        {m.agents.length > 4 && (
                          <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[8px] font-bold text-neutral-500 border border-white shrink-0">
                            +{m.agents.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Metrics Summary ─────────────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Performance summary</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Real-time usage metrics and aggregates.</p>
        </div>

        {/* 4 Metrics summary cards in a row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metricsList.map(({ label, value, trend, icon: Icon, iconBg }) => (
            <Card key={label} className="bg-white border-neutral-200 shadow-xs hover:shadow-xs transition-shadow">
              <CardContent className="flex items-center gap-3.5 p-4.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider leading-none">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-neutral-900 tracking-tight leading-none">
                    {value}
                  </p>
                  <p className="text-[9px] font-semibold text-emerald-600 mt-1 leading-none">
                    {trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
