"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Loader2,
  Clock,
  Bot,
  FileText,
  CheckCircle2,
  Cpu,
  Zap,
  TrendingDown,
  Database,
  ArrowUpRight,
  Code2,
  BarChart2,
  FileBarChart2,
  Network
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";
import { ExecutionGraph } from "@/components/graph/ExecutionGraph";
import { formatDate, formatCost } from "@/lib/utils";
import type {
  Mission,
  Agent,
  AgentMessage,
  Artifact,
  MissionTask,
  RuntimeMetric,
  ArtifactType
} from "@prisma/client";

type AgentWithMessages = Agent & { messages: AgentMessage[] };

interface MissionDetailClientProps {
  mission: Mission & {
    agents:          AgentWithMessages[];
    tasks:           MissionTask[];
    artifacts:       Artifact[];
    runtimeMetrics:  RuntimeMetric[];
  };
}

const statusConfig = {
  PENDING:   { label: "Pending",   variant: "secondary" as const },
  RUNNING:   { label: "Running",   variant: "default"   as const },
  PAUSED:    { label: "Paused",    variant: "warning"   as const },
  COMPLETED: { label: "Completed", variant: "success"   as const },
  FAILED:    { label: "Failed",    variant: "error"     as const },
  CANCELLED: { label: "Cancelled", variant: "secondary" as const },
} as const;

const typeConfig: Record<ArtifactType, { icon: React.ElementType; color: string }> = {
  DOCUMENT: { icon: FileText,      color: "text-(--color-primary)"  },
  CODE:     { icon: Code2,         color: "text-(--color-warning)"   },
  ANALYSIS: { icon: BarChart2,     color: "text-(--color-info)"      },
  REPORT:   { icon: FileBarChart2, color: "text-(--color-success)"   },
  DIAGRAM:  { icon: Network,       color: "text-(--color-primary-hover)" },
  DATA:     { icon: Database,      color: "text-(--color-text-secondary)" },
};

export function MissionDetailClient({ mission: initialMission }: MissionDetailClientProps) {
  const router = useRouter();
  const [mission, setMission]   = useState(initialMission);
  const [isRunning, setIsRunning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [retryingAgentId, setRetryingAgentId] = useState<string | null>(null);

  // Human intervention states
  const [instructionText, setInstructionText] = useState("");
  const [isInjecting, setIsInjecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [revisingAgentId, setRevisingAgentId] = useState<string | null>(null);
  const [activeRevisionId, setActiveRevisionId] = useState<string | null>(null);
  const [revisionPrompts, setRevisionPrompts] = useState<Record<string, string>>({});

  async function handleRetryAgent(agentId: string) {
    setRetryingAgentId(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}/retry`, { method: "POST" });
      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      console.error("Failed to retry agent:", error);
    } finally {
      setRetryingAgentId(null);
    }
  }

  async function handleInjectInstruction() {
    if (!instructionText.trim()) return;
    setIsInjecting(true);
    try {
      const res = await fetch(`/api/missions/${mission.id}/instruction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: instructionText }),
      });
      if (res.ok) {
        setInstructionText("");
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      console.error("Failed to inject instruction:", error);
    } finally {
      setIsInjecting(false);
    }
  }

  async function handleReviseAgent(agentId: string) {
    const prompt = revisionPrompts[agentId];
    if (!prompt?.trim()) return;
    setRevisingAgentId(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionPrompt: prompt }),
      });
      if (res.ok) {
        setRevisionPrompts((prev) => ({ ...prev, [agentId]: "" }));
        setActiveRevisionId(null);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      console.error("Failed to revise agent:", error);
    } finally {
      setRevisingAgentId(null);
    }
  }

  async function handleApproveMission() {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/missions/${mission.id}/approve`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.mission) {
          setMission((prev) => ({ ...prev, approved: true }));
        }
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      console.error("Failed to approve final deliverables:", error);
    } finally {
      setIsApproving(false);
    }
  }

  // ── Telemetry calculations ─────────────────────────────────────────
  const metrics = mission.runtimeMetrics;
  const totalCalls = metrics.length;
  const cacheHits = metrics.filter((m) => m.cacheHit).length;
  const semanticCacheHits = metrics.filter((m) => m.semanticCacheHit).length;
  const estimatedSavings = metrics.reduce((sum, m) => sum + m.estimatedSavings, 0);

  const avgLatency =
    totalCalls > 0
      ? metrics.reduce((sum, m) => sum + m.latencyMs, 0) / totalCalls / 1000
      : 0;

  // Flatten messages for SSE feed
  const allMessages = mission.agents
    .flatMap((a) =>
      a.messages.map((m) => ({
        ...m,
        agentName: a.name,
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : (m.createdAt as string),
      }))
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  async function handleRun() {
    setIsRunning(true);
    try {
      const res = await fetch(`/api/missions/${mission.id}/run`, { method: "POST" });
      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5).trim());
              if (data.missionId) {
                startTransition(() => router.refresh());
              }
            } catch {}
          }
        }
      }
    } finally {
      setIsRunning(false);
      startTransition(() => router.refresh());
    }
  }

  const cfg = statusConfig[mission.status] ?? statusConfig.PENDING;
  const canRun = mission.status === "PENDING" || mission.status === "FAILED";

  return (
    <div className="flex h-full flex-col gap-6">
      {/* ── Top Header Section ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl font-bold text-(--color-text-primary) truncate">
              {mission.title}
            </h1>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            {mission.approved && (
              <Badge variant="success">Package Approved</Badge>
            )}
          </div>
          <p className="text-sm text-(--color-text-muted) leading-relaxed max-w-3xl">
            {mission.description}
          </p>

          <div className="mt-2 flex items-center gap-4 text-[10px] text-(--color-text-disabled) flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Created {formatDate(mission.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Bot className="h-3 w-3" /> {mission.agents.length} specialist agents
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {mission.tasks.length} tasks scheduled
            </span>
          </div>

          {(mission.status === "RUNNING" || mission.progress > 0) && (
            <div className="mt-3 max-w-sm space-y-1">
              <div className="flex justify-between text-[10px] text-(--color-text-muted)">
                <span>Mission Progress</span>
                <span>{mission.progress}%</span>
              </div>
              <Progress value={mission.progress} />
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {mission.status === "COMPLETED" && !mission.approved && (
            <Button
              onClick={handleApproveMission}
              disabled={isApproving || isPending}
              className="bg-(--color-success) hover:bg-(--color-success-hover) text-white text-xs h-9"
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Approving...
                </>
              ) : (
                "Approve Final Package"
              )}
            </Button>
          )}

          {canRun && (
            <Button onClick={handleRun} disabled={isRunning || isPending} className="h-9 text-xs">
              {isRunning ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Running...
                </>
              ) : (
                <>
                  <Play className="mr-1.5 h-3.5 w-3.5" /> Execute Stage Pipeline
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── Runtime Metrics Summary Strip ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "Total Call invocations", value: totalCalls, icon: Cpu, color: "text-(--color-primary)" },
          { label: "Standard Cache Hits", value: cacheHits, icon: Database, color: "text-(--color-info)" },
          { label: "Semantic Cache Hits", value: semanticCacheHits, icon: Zap, color: "text-(--color-warning)" },
          { label: "Estimated Savings", value: formatCost(estimatedSavings), icon: TrendingDown, color: "text-(--color-success)" },
          { label: "Average Response Latency", value: `${avgLatency.toFixed(2)}s`, icon: Clock, color: "text-(--color-text-secondary)" },
        ].map((item, idx) => (
          <Card key={idx} className="bg-(--color-bg-surface)">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-bg-elevated)">
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-(--color-text-muted)">{item.label}</p>
                <p className="mt-0.5 text-base font-bold text-(--color-text-primary)">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Human Intervention Console ─────────────────────────────── */}
      <Card className="bg-(--color-bg-surface) border border-(--color-border-default)">
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-primary)">
              Human Intervention Console
            </h3>
            <p className="text-[10px] text-(--color-text-muted) mt-0.5">
              Inject strategic directives or prompt mission-wide instructions. These guidelines will automatically append to all subsequent agent context frames.
            </p>
          </div>
          <div className="flex gap-3">
            <textarea
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              placeholder="Inject custom context or new instructions (e.g. 'Ensure all database structures prioritize security audit keys' or 'Include a React Native architecture alternative')...."
              className="flex-1 min-h-[56px] text-xs rounded-lg border border-(--color-border-subtle) bg-(--color-bg-base) p-2.5 text-(--color-text-secondary) focus:outline-none focus:border-(--color-primary) placeholder-(--color-text-disabled)"
            />
            <Button
              onClick={handleInjectInstruction}
              disabled={isInjecting || isPending || !instructionText.trim()}
              className="shrink-0 h-auto self-stretch text-xs"
            >
              {isInjecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Inject Instruction"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Center Execution Canvas & Live Activity Feed ──────────────── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_360px]" style={{ minHeight: "480px" }}>
        <div className="rounded-xl overflow-hidden border border-(--color-border-default) bg-(--color-bg-base)">
          <ExecutionGraph
            mission={{ id: mission.id, title: mission.title, status: mission.status }}
            agents={mission.agents.map((a) => ({
              id: a.id,
              name: a.name,
              role: a.role,
              status: a.status,
              currentTask: a.currentTask ?? undefined,
            }))}
          />
        </div>

        <div className="rounded-xl border border-(--color-border-default) bg-(--color-bg-elevated) overflow-hidden">
          <AgentActivityFeed
            missionId={mission.id}
            initialMessages={allMessages}
            isRunning={isRunning || mission.status === "RUNNING"}
          />
        </div>
      </div>

      {/* ── Bottom Section: Specialist Agents & Deliverables ─────────────── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Agent Cards Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Specialist Agents Configuration
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {mission.agents.map((agent) => {
              const agentMetrics = metrics.filter((m) => m.agentId === agent.id);
              const callsCount = agentMetrics.length;
              const hitsCount = agentMetrics.filter((m) => m.cacheHit || m.semanticCacheHit).length;
              const savings = agentMetrics.reduce((sum, m) => sum + m.estimatedSavings, 0);

              return (
                <Card key={agent.id} className="bg-(--color-bg-surface) hover:bg-(--color-bg-overlay) transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--color-primary-muted) text-(--color-primary)">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-xs font-bold">{agent.name}</CardTitle>
                          <CardDescription className="text-[10px]">{agent.role}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={
                        agent.status === "COMPLETED" || agent.status === "DONE"
                          ? "success"
                          : agent.status === "RUNNING" || agent.status === "WORKING" || agent.status === "THINKING"
                          ? "default"
                          : agent.status === "RETRYING"
                          ? "warning"
                          : agent.status === "FAILED" || agent.status === "ERROR"
                          ? "error"
                          : "secondary"
                      }>
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 pt-0">
                    {agent.currentTask && (
                      <div className="rounded-md bg-(--color-bg-elevated) px-2.5 py-1.5 border border-(--color-border-subtle)">
                        <p className="text-[9px] text-(--color-text-disabled) uppercase tracking-wider">Current Activity</p>
                        <p className="text-[10px] text-(--color-text-secondary) mt-0.5 leading-snug">{agent.currentTask}</p>
                      </div>
                    )}

                    {agent.errorMessage && (
                      <div className="rounded-md bg-(--color-error)/10 border border-(--color-error)/20 px-2.5 py-1.5 text-[10px] text-(--color-error) leading-relaxed whitespace-pre-wrap">
                        <p className="font-semibold text-[10px] mb-0.5">Execution Error</p>
                        {agent.errorMessage}
                      </div>
                    )}

                    {(agent.status === "FAILED" || agent.status === "ERROR") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-7 border-(--color-error)/30 text-(--color-error) hover:bg-(--color-error)/10 hover:text-(--color-error)"
                        onClick={() => handleRetryAgent(agent.id)}
                        disabled={retryingAgentId === agent.id}
                      >
                        {retryingAgentId === agent.id ? (
                          <>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          "Retry Agent Execution"
                        )}
                      </Button>
                    )}

                    {(agent.status === "COMPLETED" || agent.status === "DONE") && (
                      <div className="space-y-2 border-t border-(--color-border-subtle) pt-2">
                        {activeRevisionId === agent.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={revisionPrompts[agent.id] || ""}
                              onChange={(e) =>
                                setRevisionPrompts((prev) => ({ ...prev, [agent.id]: e.target.value }))
                              }
                              placeholder="Specify revisions (e.g., 'Add system logging configurations' or 'Expand test matrices')..."
                              className="w-full min-h-[50px] text-[10px] rounded border border-(--color-border-subtle) bg-(--color-bg-elevated) p-1.5 focus:outline-none focus:border-(--color-primary) placeholder-(--color-text-disabled) text-(--color-text-secondary)"
                            />
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                className="flex-1 text-[9px] h-6 bg-(--color-primary) text-white"
                                onClick={() => handleReviseAgent(agent.id)}
                                disabled={revisingAgentId === agent.id || !(revisionPrompts[agent.id]?.trim())}
                              >
                                {revisingAgentId === agent.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Submit Revision"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 text-[9px] h-6"
                                onClick={() => setActiveRevisionId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-[10px] h-7"
                              onClick={() => setActiveRevisionId(agent.id)}
                            >
                              Revise Output
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-[10px] h-7"
                              onClick={() => handleRetryAgent(agent.id)}
                              disabled={retryingAgentId === agent.id}
                            >
                              {retryingAgentId === agent.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Regenerate"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 border-t border-(--color-border-subtle) pt-2 text-center">
                      <div>
                        <p className="text-[9px] text-(--color-text-muted)">Calls</p>
                        <p className="text-xs font-bold text-(--color-text-primary)">{callsCount}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-(--color-text-muted)">Cache Hits</p>
                        <p className="text-xs font-bold text-(--color-text-primary)">{hitsCount}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-(--color-text-muted)">Savings</p>
                        <p className="text-xs font-bold text-(--color-success)">{formatCost(savings)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Deliverables / Artifacts List */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Deliverable Artifacts Output
          </h2>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {mission.artifacts.length === 0 ? (
              <Card className="bg-(--color-bg-surface) py-12 text-center">
                <CardContent className="flex flex-col items-center">
                  <FileText className="h-8 w-8 text-(--color-text-disabled) mb-2" />
                  <p className="text-xs text-(--color-text-muted)">No artifacts have been output yet.</p>
                </CardContent>
              </Card>
            ) : (
              mission.artifacts.map((artifact) => {
                const cfg = typeConfig[artifact.type] || { icon: FileText, color: "text-(--color-text-muted)" };
                const Icon = cfg.icon;

                return (
                  <div
                    key={artifact.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) p-3 hover:bg-(--color-bg-overlay) transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-bg-elevated)">
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-(--color-text-primary) truncate">{artifact.title}</p>
                        <p className="text-[9px] text-(--color-text-muted) mt-0.5">
                          v{artifact.version} • {(artifact.sizeBytes / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" asChild>
                      <a href={`/missions/${mission.id}/deliverables`} aria-label="View Artifact">
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
