import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Sparkles,
  Heart,
  Leaf,
  Shield,
  Bot,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
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

async function getAllMissions(): Promise<MissionWithAgents[]> {
  const missions = await db.mission.findMany({
    include: {
      agents: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return missions as unknown as MissionWithAgents[];
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

export const metadata = {
  title: "Missions — Foundry",
  description: "Manage and run multi-agent execution pipelines.",
};

export default async function MissionsListPage() {
  const missions = await getAllMissions();

  return (
    <div className="space-y-6 animate-fade-up max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900">All missions</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Track, edit, and launch agent pipelines.</p>
        </div>
        <Link href="/missions/new">
          <Button className="bg-(--color-primary) text-white hover:bg-(--color-primary-hover) rounded-full text-xs font-semibold px-4 shadow-sm shadow-neutral-900/5">
            <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={2.5} /> New Mission
          </Button>
        </Link>
      </div>

      {missions.length === 0 ? (
        <Card className="bg-white py-16 text-center border-dashed border-neutral-200/80 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center max-w-sm mx-auto p-4">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-pink-500">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-sm font-bold text-neutral-900">No missions found</h3>
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
        /* Full Grid Layout containing all missions */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {missions.map((m, idx) => {
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

                {/* Progress & Bottom details */}
                <div className="mt-4 pt-3.5 border-t border-neutral-100 space-y-3">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] uppercase tracking-wider font-bold text-neutral-400">
                      <span>Progress</span>
                      <span className="text-neutral-700">{m.progress}%</span>
                    </div>
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
  );
}
