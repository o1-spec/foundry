"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, AlertCircle, CheckCircle2, Loader2, Wrench, MessageSquare, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelativeTime } from "@/lib/utils";
import type { MessageType } from "@prisma/client";

interface AgentMsg {
  id: string;
  agentId?: string | null;
  agentName?: string;
  role: string;
  type: MessageType;
  content: string;
  createdAt: string;
}

interface AgentActivityFeedProps {
  missionId: string;
  initialMessages?: AgentMsg[];
  isRunning?: boolean;
}

const typeConfig: Record<MessageType, {
  icon: React.ElementType;
  color: string;
  label: string;
}> = {
  LOG: { icon: MessageSquare, color: "text-(--color-text-muted)", label: "Log" },
  TOOL_CALL: { icon: Wrench, color: "text-(--color-warning)", label: "Tool call" },
  TOOL_RESULT: { icon: Info, color: "text-(--color-info)", label: "Tool result" },
  COMPLETION: { icon: CheckCircle2, color: "text-(--color-success)", label: "Completed" },
  ERROR: { icon: AlertCircle, color: "text-(--color-error)", label: "Error" },
  STATUS: { icon: Loader2, color: "text-(--color-primary)", label: "Status" },
};

function renderMessageContent(text: string) {
  const lines = text.split("\n");
  const rendered: React.ReactNode[] = [];
  let currentCodeLines: string[] = [];
  let inCodeBlock = false;

  lines.forEach((line, idx) => {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        rendered.push(
          <pre
            key={`code-${idx}`}
            className="font-mono bg-neutral-50 text-[10px] border border-neutral-200/60 rounded-lg p-2.5 my-2 overflow-x-auto text-amber-700 whitespace-pre leading-relaxed select-all"
          >
            {currentCodeLines.join("\n")}
          </pre>
        );
        currentCodeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      currentCodeLines.push(line);
    } else {
      const cleanLine = line.trim();
      if (cleanLine.startsWith("# ")) {
        rendered.push(
          <h1 key={idx} className="text-xs font-bold text-neutral-900 mt-3 mb-1.5 border-b border-neutral-100 pb-0.5 font-serif">
            {cleanLine.slice(2)}
          </h1>
        );
      } else if (cleanLine.startsWith("## ")) {
        rendered.push(
          <h2 key={idx} className="text-xs font-bold text-neutral-900 mt-2.5 mb-1 font-serif">
            {cleanLine.slice(3)}
          </h2>
        );
      } else if (cleanLine.startsWith("### ")) {
        rendered.push(
          <h3 key={idx} className="text-[11px] font-semibold text-neutral-800 mt-2 mb-0.5 font-serif">
            {cleanLine.slice(4)}
          </h3>
        );
      } else if (cleanLine.startsWith("#### ")) {
        rendered.push(
          <h4 key={idx} className="text-[10px] font-semibold text-neutral-800 mt-1.5 mb-0.5">
            {cleanLine.slice(5)}
          </h4>
        );
      } else if (cleanLine.startsWith("- ")) {
        let elementContent: React.ReactNode = cleanLine.slice(2);
        if (typeof elementContent === "string" && elementContent.includes("**")) {
          const parts = elementContent.split("**");
          elementContent = parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold text-neutral-950">{part}</strong> : part));
        }
        rendered.push(
          <li key={idx} className="ml-4 list-disc text-xs text-neutral-600 mb-0.5 leading-relaxed">
            {elementContent}
          </li>
        );
      } else if (/^\d+\.\s/.test(cleanLine)) {
        const match = cleanLine.match(/^(\d+\.\s)(.*)/);
        const listPrefix = match ? match[1] : "";
        let listText = match ? match[2] : cleanLine;
        let elementContent: React.ReactNode = listText;
        if (typeof elementContent === "string" && elementContent.includes("**")) {
          const parts = elementContent.split("**");
          elementContent = parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold text-neutral-950">{part}</strong> : part));
        }
        rendered.push(
          <p key={idx} className="text-xs text-neutral-600 ml-4 mb-1 leading-relaxed">
            <span className="font-semibold text-neutral-400 mr-1">{listPrefix}</span>
            {elementContent}
          </p>
        );
      } else if (cleanLine === "") {
        rendered.push(<div key={idx} className="h-1.5" />);
      } else {
        let elementContent: React.ReactNode = line;
        if (line.includes("**")) {
          const parts = line.split("**");
          elementContent = parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold text-neutral-950">{part}</strong> : part));
        }
        rendered.push(
          <p key={idx} className="text-xs text-neutral-600 mb-1 leading-relaxed break-words">
            {elementContent}
          </p>
        );
      }
    }
  });

  return rendered;
}

export function AgentActivityFeed({
  missionId,
  initialMessages = [],
  isRunning = false,
}: AgentActivityFeedProps) {
  const [messages, setMessages] = useState<AgentMsg[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRunning) return;

    const es = new EventSource(`/api/missions/${missionId}/stream`);

    es.addEventListener("message", (e) => {
      try {
        const data = JSON.parse(e.data) as AgentMsg;
        setMessages((prev) => [...prev, data]);
      } catch { }
    });

    es.addEventListener("done", () => es.close());
    es.onerror = () => es.close();

    return () => es.close();
  }, [missionId, isRunning]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--color-border-subtle) px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-(--color-primary)" />
          <span className="text-xs font-semibold text-(--color-text-primary)">
            Agent Activity
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1.5 text-[10px] text-(--color-warning)">
              <Loader2 className="h-3 w-3 animate-spin" /> Live
            </span>
          )}
          <Badge variant="secondary">{messages.length} events</Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-0 p-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="h-8 w-8 text-(--color-text-disabled) mb-3" />
              <p className="text-xs text-(--color-text-muted)">No activity yet</p>
              <p className="text-[10px] text-(--color-text-disabled) mt-1">
                Start the mission to see agent messages
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const cfg = typeConfig[msg.type] ?? typeConfig.LOG;
              const Icon = cfg.icon;
              const isSpinning = msg.type === "STATUS";
              return (
                <div
                  key={msg.id ?? i}
                  className="flex gap-2.5 rounded-lg px-2 py-2.5 transition-colors hover:bg-(--color-bg-elevated) animate-fade-up"
                >
                  <div className="mt-0.5 shrink-0">
                    <Icon className={`h-3 w-3 ${cfg.color} ${isSpinning ? "animate-spin" : ""}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      {msg.agentName && (
                        <span className="text-[10px] font-semibold text-(--color-primary)">
                          {msg.agentName}
                        </span>
                      )}
                      <span className="text-[10px] text-(--color-text-disabled)">
                        {cfg.label}
                      </span>
                      <span className="ml-auto text-[10px] text-(--color-text-disabled)">
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs text-(--color-text-secondary) leading-relaxed">
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
