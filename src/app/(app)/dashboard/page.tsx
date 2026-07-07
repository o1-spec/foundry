import Link from "next/link";
import { Plus, Target, Cpu, FileText, Zap, Compass, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatDate, formatCost } from "@/lib/utils";
import type { MissionStatus } from "@prisma/client";

interface MissionWithCount {
  id:                   string;
  title:                string;
  description:          string;
  status:               MissionStatus;
  progress:             number;
  type:                 string;
  createdAt:            Date;
  _count: {
    agents:    number;
    artifacts: number;
    tasks:     number;
  };
}

async function getDashboardMetrics() {
  const [missions, totalArtifacts, metricsSummary] = await Promise.all([
    db.mission.findMany({
      include: {
        _count: { select: { agents: true, artifacts: true, tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.artifact.count(),
    db.runtimeMetric.aggregate({
      _sum: { estimatedSavings: true },
      _avg: { latencyMs: true },
    }),
  ]);

  return {
    missions: missions as MissionWithCount[],
    totalArtifacts,
    estimatedSavings: metricsSummary._sum.estimatedSavings ?? 0,
    avgLatencyMs:     metricsSummary._avg.latencyMs     ?? 0,
  };
}

const statusConfig: Record<MissionStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "secondary" }> = {
  PENDING:   { label: "Pending",   variant: "secondary" },
  RUNNING:   { label: "Running",   variant: "default" },
  PAUSED:    { label: "Paused",    variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  FAILED:    { label: "Failed",    variant: "error" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
};

export default async function DashboardPage() {
  const { missions, totalArtifacts, estimatedSavings, avgLatencyMs } = await getDashboardMetrics();

  const statsCards = [
    { label: "Total Missions", value: missions.length, icon: Target, color: "text-(--color-primary)" },
    { label: "Artifacts Created", value: totalArtifacts, icon: FileText, color: "text-(--color-success)" },
    { label: "Savings Generated", value: formatCost(estimatedSavings), icon: Zap, color: "text-(--color-warning)" },
    { label: "Average Response Time", value: `${(avgLatencyMs / 1000).toFixed(2)}s`, icon: Cpu, color: "text-(--color-info)" },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Command Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border-default) bg-(--color-bg-surface) p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--color-text-primary)">Foundry Command Center</h1>
          <p className="mt-1 text-sm text-(--color-text-muted) max-w-lg">
            Deploy specialized AI agent teams, orchestrate execution pipelines, and track deliverable telemetry.
          </p>
        </div>
        <Link href="/missions/new" className="shrink-0">
          <Button size="lg" className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Create New Mission
          </Button>
        </Link>
      </div>

      {/* Metrics Strips */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statsCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-(--color-bg-surface)">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-bg-elevated)">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-(--color-text-muted) uppercase tracking-wider">{label}</p>
                <p className="mt-0.5 text-lg font-bold text-(--color-text-primary) truncate">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Missions list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Recent Staged Operations
          </h2>
          <span className="text-[10px] text-(--color-text-disabled)">{missions.length} active runs</span>
        </div>

        {missions.length === 0 ? (
          <Card className="bg-(--color-bg-surface) py-16 text-center border-dashed">
            <CardContent className="flex flex-col items-center justify-center max-w-sm mx-auto">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--color-bg-elevated)">
                <Compass className="h-6 w-6 text-(--color-text-muted)" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-(--color-text-primary)">No active missions</h3>
              <p className="mb-5 text-xs text-(--color-text-muted)">
                Launch your first multi-agent team to begin generating product schemas, specs, and roadmaps.
              </p>
              <Link href="/missions/new">
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5" /> Initialize Mission
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-(--color-border-subtle) bg-(--color-bg-elevated) text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
                    <th className="p-4">Mission</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 w-44">Progress</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border-subtle) text-(--color-text-secondary)">
                  {missions.map((m) => {
                    const cfg = statusConfig[m.status] || statusConfig.PENDING;
                    return (
                      <tr
                        key={m.id}
                        className="group hover:bg-(--color-bg-overlay) transition-colors duration-150"
                      >
                        <td className="p-4 font-semibold text-(--color-text-primary)">
                          <Link href={`/missions/${m.id}`} className="hover:underline block truncate max-w-xs">
                            {m.title}
                          </Link>
                          <span className="text-[10px] text-(--color-text-disabled) font-normal mt-0.5 block truncate max-w-xs">
                            {m.description}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">{m.type}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-(--color-text-muted)">
                              <span>{m.progress}%</span>
                            </div>
                            <Progress value={m.progress} />
                          </div>
                        </td>
                        <td className="p-4 text-(--color-text-disabled)">
                          {formatDate(m.createdAt)}
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/missions/${m.id}`}>
                            <Button variant="ghost" size="sm" className="opacity-80 group-hover:opacity-100 transition-opacity">
                              Open <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
