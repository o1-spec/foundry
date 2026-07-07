"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionNodeData {
  label: string;
  status: string;
}

export const MissionNode = memo(function MissionNode({ data }: { data: MissionNodeData }) {
  const isRunning = data.status === "RUNNING";
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border bg-(--color-bg-elevated) px-5 py-4 shadow-lg shadow-black/30 min-w-[160px]",
        isRunning
          ? "border-(--color-primary) animate-pulse-ring"
          : data.status === "COMPLETED"
          ? "border-(--color-success)/50"
          : data.status === "FAILED"
          ? "border-(--color-error)/50"
          : "border-(--color-border-default)"
      )}
    >
      <div className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg",
        isRunning ? "bg-(--color-primary)" : "bg-(--color-bg-overlay)"
      )}>
        <Zap className={cn("h-4 w-4", isRunning ? "text-white" : "text-(--color-text-muted)")} />
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-(--color-text-primary) leading-tight max-w-[140px] truncate">
          {data.label}
        </p>
        <p className="mt-0.5 text-[9px] uppercase tracking-wider text-(--color-text-muted)">Mission</p>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
