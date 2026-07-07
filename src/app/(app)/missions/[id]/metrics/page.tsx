import { notFound } from "next/navigation";
import { Cpu, Database, Zap, Clock, DollarSign, TrendingDown, Info, Bot } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatCost } from "@/lib/utils";

interface MetricsPageProps {
  params: Promise<{ id: string }>;
}

export default async function MetricsPage({ params }: MetricsPageProps) {
  const { id } = await params;

  const mission = await db.mission.findUnique({
    where: { id },
    include: {
      runtimeMetrics: { orderBy: { createdAt: "asc" } },
      agents: { select: { id: true, name: true, role: true } },
    },
  });

  if (!mission) notFound();

  const isDemoMode = mission.runtimeMetrics.length === 0;

  // Fallback demo metrics if mission runtime metrics are empty
  const metrics = isDemoMode
    ? [
      {
        id: "demo-1",
        agentId: mission.agents[0]?.id || "1",
        provider: "btl",
        model: "gpt-4o",
        latencyMs: 1250,
        promptTokens: 850,
        completionTokens: 950,
        totalTokens: 1800,
        estimatedCost: 0.012,
        estimatedSavings: 0.0,
        cacheHit: false,
        semanticCacheHit: false,
        createdAt: new Date(Date.now() - 600000),
      },
      {
        id: "demo-2",
        agentId: mission.agents[1]?.id || "2",
        provider: "btl",
        model: "gpt-4o",
        latencyMs: 380,
        promptTokens: 920,
        completionTokens: 1100,
        totalTokens: 2020,
        estimatedCost: 0.0,
        estimatedSavings: 0.015,
        cacheHit: true,
        semanticCacheHit: false,
        createdAt: new Date(Date.now() - 500000),
      },
      {
        id: "demo-3",
        agentId: mission.agents[2]?.id || "3",
        provider: "btl",
        model: "gpt-4o",
        latencyMs: 290,
        promptTokens: 1200,
        completionTokens: 1400,
        totalTokens: 2600,
        estimatedCost: 0.0,
        estimatedSavings: 0.022,
        cacheHit: false,
        semanticCacheHit: true,
        createdAt: new Date(Date.now() - 400000),
      },
      {
        id: "demo-4",
        agentId: mission.agents[3]?.id || "4",
        provider: "btl",
        model: "gpt-4o",
        latencyMs: 1850,
        promptTokens: 1500,
        completionTokens: 1600,
        totalTokens: 3100,
        estimatedCost: 0.025,
        estimatedSavings: 0.0,
        cacheHit: false,
        semanticCacheHit: false,
        createdAt: new Date(Date.now() - 300000),
      },
      {
        id: "demo-5",
        agentId: mission.agents[4]?.id || "5",
        provider: "btl",
        model: "gpt-4o-mini",
        latencyMs: 720,
        promptTokens: 1800,
        completionTokens: 1900,
        totalTokens: 3700,
        estimatedCost: 0.003,
        estimatedSavings: 0.0,
        cacheHit: false,
        semanticCacheHit: false,
        createdAt: new Date(Date.now() - 200000),
      },
    ]
    : mission.runtimeMetrics;

  // ── Calculation summaries ──────────────────────────────────────────
  const totalCalls = metrics.length;
  const exactCacheHits = metrics.filter((m) => m.cacheHit).length;
  const semanticCacheHits = metrics.filter((m) => m.semanticCacheHit).length;
  const estimatedCost = metrics.reduce((sum, m) => sum + m.estimatedCost, 0);
  const estimatedSavings = metrics.reduce((sum, m) => sum + m.estimatedSavings, 0);
  const totalLatencyMs = metrics.reduce((sum, m) => sum + m.latencyMs, 0);
  const avgLatencySec = totalCalls > 0 ? totalLatencyMs / totalCalls / 1000 : 0;

  // Calculate provider/model distribution counts
  const modelDistribution = metrics.reduce<Record<string, { count: number; provider: string }>>(
    (acc, m) => {
      const key = `${m.provider}/${m.model}`;
      if (!acc[key]) {
        acc[key] = { count: 0, provider: m.provider };
      }
      acc[key].count++;
      return acc;
    },
    {}
  );

  const modelDistArray = Object.entries(modelDistribution).map(([name, val]) => ({
    name,
    count: val.count,
    provider: val.provider,
    percentage: totalCalls > 0 ? (val.count / totalCalls) * 100 : 0,
  }));

  const cacheMisses = totalCalls - exactCacheHits - semanticCacheHits;
  const exactHitPercentage = totalCalls > 0 ? (exactCacheHits / totalCalls) * 100 : 0;
  const semanticHitPercentage = totalCalls > 0 ? (semanticCacheHits / totalCalls) * 100 : 0;
  const missPercentage = totalCalls > 0 ? (cacheMisses / totalCalls) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-up max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900">Runtime Telemetry</h1>
            {isDemoMode && <Badge variant="secondary">Demo Data</Badge>}
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">{mission.title}</p>
        </div>
      </div>

      {isDemoMode && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-blue-600 leading-relaxed shadow-xs">
          <Info className="h-4 w-4 shrink-0" />
          <p>
            <strong>Operational Sandbox Sandbox:</strong> No live runtime calls have been run for this mission yet. Displaying simulated, pre-compiled EDB metrics telemetry details below.
          </p>
        </div>
      )}

      {/* Stats summary strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {[
          { label: "Total Calls", value: totalCalls, icon: Cpu, color: "text-(--color-primary)" },
          { label: "Exact Hits", value: exactCacheHits, icon: Database, color: "text-(--color-info)" },
          { label: "Semantic Hits", value: semanticCacheHits, icon: Zap, color: "text-(--color-warning)" },
          { label: "Total Cost", value: formatCost(estimatedCost), icon: DollarSign, color: "text-(--color-error)" },
          { label: "Total Savings", value: formatCost(estimatedSavings), icon: TrendingDown, color: "text-(--color-success)" },
          { label: "Avg Latency", value: `${avgLatencySec.toFixed(2)}s`, icon: Clock, color: "text-(--color-text-secondary)" },
        ].map((item, idx) => (
          <Card key={idx} className="bg-(--color-bg-surface)">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-bg-elevated)">
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-(--color-text-muted) uppercase tracking-wider">{item.label}</p>
                <p className="mt-0.5 text-base font-bold text-(--color-text-primary)">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cache Efficiency stacked chart */}
        <Card className="bg-(--color-bg-surface)">
          <CardHeader>
            <CardTitle>Cache Efficiency</CardTitle>
            <CardDescription>Ratio of exact hits, semantic hits, and direct API calls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-4 w-full rounded-full bg-(--color-bg-elevated) overflow-hidden flex">
              <div
                className="h-full bg-(--color-info) transition-all duration-300"
                style={{ width: `${exactHitPercentage}%` }}
                title={`Exact Cache Hit: ${exactHitPercentage.toFixed(1)}%`}
              />
              <div
                className="h-full bg-(--color-warning) transition-all duration-300"
                style={{ width: `${semanticHitPercentage}%` }}
                title={`Semantic Cache Hit: ${semanticHitPercentage.toFixed(1)}%`}
              />
              <div
                className="h-full bg-(--color-bg-overlay) transition-all duration-300"
                style={{ width: `${missPercentage}%` }}
                title={`Cache Miss: ${missPercentage.toFixed(1)}%`}
              />
            </div>

            {/* Legend info */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-(--color-text-secondary)">
                  <span className="h-2 w-2 rounded-full bg-(--color-info)" />
                  <span>Exact Hits</span>
                </div>
                <p className="mt-1 text-base font-bold text-(--color-text-primary)">
                  {exactHitPercentage.toFixed(1)}%
                </p>
                <span className="text-[10px] text-(--color-text-disabled)">{exactCacheHits} calls</span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-(--color-text-secondary)">
                  <span className="h-2 w-2 rounded-full bg-(--color-warning)" />
                  <span>Semantic Hits</span>
                </div>
                <p className="mt-1 text-base font-bold text-(--color-text-primary)">
                  {semanticHitPercentage.toFixed(1)}%
                </p>
                <span className="text-[10px] text-(--color-text-disabled)">{semanticCacheHits} calls</span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-(--color-text-secondary)">
                  <span className="h-2 w-2 rounded-full bg-(--color-bg-overlay)" />
                  <span>Cache Misses</span>
                </div>
                <p className="mt-1 text-base font-bold text-(--color-text-primary)">
                  {missPercentage.toFixed(1)}%
                </p>
                <span className="text-[10px] text-(--color-text-disabled)">{cacheMisses} calls</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model distribution chart list */}
        <Card className="bg-(--color-bg-surface)">
          <CardHeader>
            <CardTitle>Provider &amp; Model Distribution</CardTitle>
            <CardDescription>Call allocation mapping per backend AI engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modelDistArray.map((m) => (
              <div key={m.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-(--color-text-primary)">{m.name.split("/")[1]}</span>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">
                      {m.provider}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-(--color-text-muted)">
                    {m.count} call{m.count !== 1 ? "s" : ""} ({m.percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={m.percentage} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Execution latency and token table */}
      <Card className="bg-(--color-bg-surface)">
        <CardHeader>
          <CardTitle>Call Telemetry Logs</CardTitle>
          <CardDescription>Breakdown metrics for each agent execution trace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-(--color-border-subtle) bg-(--color-bg-elevated) text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
                  <th className="p-3">Agent</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Cache State</th>
                  <th className="p-3">Tokens (P/C)</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border-subtle) text-(--color-text-secondary)">
                {metrics.map((m) => {
                  const agent = mission.agents.find((a) => a.id === m.agentId);
                  return (
                    <tr key={m.id} className="hover:bg-(--color-bg-overlay) transition-colors">
                      <td className="p-3 font-medium text-(--color-text-primary) flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5 text-(--color-primary)" />
                        {agent?.name || "System Orchestrator"}
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-[10px] bg-(--color-bg-elevated) px-1.5 py-0.5 rounded border border-(--color-border-subtle)">
                          {m.model}
                        </span>
                      </td>
                      <td className="p-3">{(m.latencyMs / 1000).toFixed(2)}s</td>
                      <td className="p-3">
                        {m.cacheHit ? (
                          <Badge variant="success" className="text-[9px]">
                            Cache Hit
                          </Badge>
                        ) : m.semanticCacheHit ? (
                          <Badge variant="warning" className="text-[9px]">
                            Semantic Hit
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px]">
                            Direct Call
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-(--color-text-disabled)">
                        {m.promptTokens} / {m.completionTokens}
                      </td>
                      <td className="p-3">
                        {m.estimatedCost > 0 ? (
                          <span className="text-(--color-error) font-medium">
                            {formatCost(m.estimatedCost)}
                          </span>
                        ) : (
                          <span className="text-(--color-success) font-semibold">Free (Saved)</span>
                        )}
                      </td>
                      <td className="p-3 text-right text-(--color-text-disabled)">
                        {formatDate(m.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
