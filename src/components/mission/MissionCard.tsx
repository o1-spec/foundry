import Link from "next/link";
import { ArrowRight, Bot, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatRelativeTime } from "@/lib/utils";
import type { MissionStatus } from "@prisma/client";

interface MissionCardProps {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  agentCount: number;
  deliverableCount: number;
  createdAt: Date;
  progress?: number;
}

const statusConfig: Record<MissionStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "secondary" }> = {
  PENDING:   { label: "Pending",   variant: "secondary" },
  RUNNING:   { label: "Running",   variant: "default" },
  PAUSED:    { label: "Paused",    variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  FAILED:    { label: "Failed",    variant: "error" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
};

export function MissionCard({
  id, title, description, status, agentCount, deliverableCount, createdAt, progress = 0,
}: MissionCardProps) {
  const cfg = statusConfig[status];

  return (
    <Link href={`/missions/${id}`} className="group block">
      <Card className="h-full transition-all duration-200 hover:border-(--color-border-strong) hover:bg-(--color-bg-overlay) group-hover:shadow-md group-hover:shadow-black/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-(--color-text-primary) leading-tight truncate group-hover:text-(--color-primary-hover) transition-colors">
                {title}
              </h3>
            </div>
            <Badge variant={cfg.variant} className="shrink-0">{cfg.label}</Badge>
          </div>
          <p className="mt-1.5 text-xs text-(--color-text-muted) leading-relaxed line-clamp-2">
            {description}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {status === "RUNNING" && (
            <Progress value={progress} className="h-0.5" />
          )}

          <div className="flex items-center gap-3 text-[10px] text-(--color-text-muted)">
            <span className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              {agentCount} agent{agentCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {deliverableCount} artifact{deliverableCount !== 1 ? "s" : ""}
            </span>
            <span className="ml-auto flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(createdAt)}
            </span>
          </div>

          <div className="flex items-center text-[10px] font-medium text-(--color-primary) opacity-0 transition-opacity group-hover:opacity-100">
            Open mission <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
