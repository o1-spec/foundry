"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Bot, Loader2, CheckCircle2, AlertCircle, Clock, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentNodeData {
  name: string;
  role: string;
  status: string;
  currentTask?: string;
}

const statusIcons: Record<string, React.ElementType> = {
  IDLE:      Clock,
  THINKING:  Loader2,
  WORKING:   Loader2,
  WAITING:   Pause,
  RUNNING:   Loader2,
  RETRYING:  Loader2,
  COMPLETED: CheckCircle2,
  FAILED:    AlertCircle,
  DONE:      CheckCircle2,
  ERROR:     AlertCircle,
};

const statusColors: Record<string, string> = {
  IDLE:      "text-(--color-agent-idle)     border-(--color-agent-idle)/30     bg-(--color-bg-surface)",
  THINKING:  "text-(--color-agent-thinking) border-(--color-agent-thinking)/40 bg-(--color-bg-surface)",
  WORKING:   "text-(--color-agent-working)  border-(--color-agent-working)/60  bg-(--color-primary-muted) animate-pulse-ring",
  WAITING:   "text-(--color-warning)        border-(--color-warning)/40         bg-(--color-bg-surface)",
  RUNNING:   "text-(--color-agent-working)  border-(--color-agent-working)/60  bg-(--color-primary-muted) animate-pulse-ring",
  RETRYING:  "text-(--color-warning)        border-(--color-warning)/60         bg-(--color-primary-muted) animate-pulse-ring",
  COMPLETED: "text-(--color-agent-done)     border-(--color-agent-done)/40     bg-(--color-bg-surface)",
  FAILED:    "text-(--color-agent-error)    border-(--color-agent-error)/40    bg-(--color-bg-surface)",
  DONE:      "text-(--color-agent-done)     border-(--color-agent-done)/40     bg-(--color-bg-surface)",
  ERROR:     "text-(--color-agent-error)    border-(--color-agent-error)/40    bg-(--color-bg-surface)",
};

const dotColors: Record<string, string> = {
  IDLE:      "bg-current opacity-30",
  THINKING:  "bg-current animate-pulse",
  WORKING:   "bg-current animate-pulse",
  WAITING:   "bg-(--color-warning)",
  RUNNING:   "bg-(--color-primary) animate-pulse",
  RETRYING:  "bg-(--color-warning) animate-pulse",
  COMPLETED: "bg-(--color-success)",
  FAILED:    "bg-(--color-error)",
  DONE:      "bg-(--color-success)",
  ERROR:     "bg-(--color-error)",
};

export const AgentNode = memo(function AgentNode({ data }: { data: AgentNodeData }) {
  const Icon       = statusIcons[data.status] ?? Bot;
  const isSpinning = data.status === "THINKING" || data.status === "WORKING" || data.status === "RUNNING" || data.status === "RETRYING";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border px-4 py-3 shadow-md shadow-black/20 transition-all",
        "min-w-[140px] max-w-[160px]",
        statusColors[data.status] ?? statusColors.IDLE
      )}
    >
      <Handle type="target" position={Position.Top} />

      {/* Icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-current/10">
        <Icon className={cn("h-4 w-4", isSpinning && "animate-spin")} />
      </div>

      {/* Name + role */}
      <div className="text-center w-full">
        <p className="text-[11px] font-semibold leading-tight truncate">{data.name}</p>
        <p className="text-[9px] uppercase tracking-wider opacity-60 mt-0.5 truncate">
          {data.role}
        </p>
      </div>

      {/* Current task tooltip */}
      {data.currentTask && (
        <p className="text-[9px] text-center opacity-50 leading-tight truncate w-full">
          {data.currentTask}
        </p>
      )}

      {/* Status dot */}
      <div className="flex items-center gap-1">
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[data.status] ?? "bg-current opacity-30")} />
        <span className="text-[9px] capitalize opacity-60">{data.status.toLowerCase()}</span>
      </div>
    </div>
  );
});
