"use client";

import { useState } from "react";
import {
  FileText,
  Code2,
  BarChart2,
  FileBarChart2,
  Network,
  Database,
  Bot,
  Clock,
  Copy,
  Check,
  Download,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Artifact, ArtifactType } from "@prisma/client";

type ArtifactWithAgent = Artifact & {
  agent?: {
    name: string;
    role: string;
  } | null;
};

interface ArtifactViewerProps {
  initialArtifacts: ArtifactWithAgent[];
}

const typeConfig: Record<ArtifactType, { icon: React.ElementType; label: string; color: string }> = {
  DOCUMENT: { icon: FileText,      label: "Document", color: "text-(--color-primary)"  },
  CODE:     { icon: Code2,         label: "Code",     color: "text-(--color-warning)"   },
  ANALYSIS: { icon: BarChart2,     label: "Analysis", color: "text-(--color-info)"      },
  REPORT:   { icon: FileBarChart2, label: "Report",   color: "text-(--color-success)"   },
  DIAGRAM:  { icon: Network,       label: "Diagram",  color: "text-(--color-primary-hover)" },
  DATA:     { icon: Database,      label: "Data",     color: "text-(--color-text-secondary)" },
};

function renderCustomMarkdown(text: string) {
  const lines = text.split("\n");
  const rendered: React.ReactNode[] = [];
  let currentCodeLines: string[] = [];
  let inCodeBlock = false;

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        rendered.push(
          <pre
            key={`code-${idx}`}
            className="font-mono bg-(--color-bg-base) text-xs border border-(--color-border-subtle) rounded-lg p-3 my-3 overflow-x-auto text-(--color-warning) whitespace-pre leading-relaxed"
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
      if (line.startsWith("# ")) {
        rendered.push(
          <h1
            key={idx}
            className="text-base font-bold border-b border-(--color-border-subtle) pb-1.5 mb-3 mt-5 text-(--color-text-primary)"
          >
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        rendered.push(
          <h2 key={idx} className="text-sm font-bold mb-2 mt-4 text-(--color-text-primary)">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        rendered.push(
          <h3 key={idx} className="text-xs font-semibold mb-1.5 mt-3 text-(--color-text-primary)">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        rendered.push(
          <li key={idx} className="ml-5 list-disc text-xs text-(--color-text-secondary) mb-1">
            {line.slice(2)}
          </li>
        );
      } else if (line.trim() === "") {
        rendered.push(<div key={idx} className="h-2" />);
      } else {
        let elementContent: React.ReactNode = line;
        if (line.includes("**")) {
          const parts = line.split("**");
          elementContent = parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-(--color-text-primary)">{part}</strong> : part));
        }
        rendered.push(
          <p key={idx} className="text-xs text-(--color-text-secondary) leading-relaxed mb-1.5">
            {elementContent}
          </p>
        );
      }
    }
  });

  return rendered;
}

export function ArtifactViewer({ initialArtifacts }: ArtifactViewerProps) {
  const [artifacts] = useState(initialArtifacts);
  const [selectedId, setSelectedId] = useState<string | null>(
    artifacts.length > 0 ? artifacts[0].id : null
  );
  const [copied, setCopied] = useState(false);

  const activeArtifact = artifacts.find((a) => a.id === selectedId);

  const groupedArtifacts = artifacts.reduce<Record<ArtifactType, ArtifactWithAgent[]>>(
    (acc, art) => {
      if (!acc[art.type]) {
        acc[art.type] = [];
      }
      acc[art.type].push(art);
      return acc;
    },
    {} as Record<ArtifactType, ArtifactWithAgent[]>
  );

  async function handleCopy() {
    if (!activeArtifact) return;
    try {
      await navigator.clipboard.writeText(activeArtifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function handleDownload() {
    if (!activeArtifact) return;
    const blob = new Blob([activeArtifact.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeArtifact.title.replace(/\s+/g, "_").toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start min-h-[500px]">
      {/* ── Left Sidebar: Grouped Categories & File Items ───────────────── */}
      <div className="space-y-4 rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) p-3">
        <h2 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-disabled)">
          Deliverable Categories
        </h2>
        <div className="space-y-4">
          {(Object.keys(groupedArtifacts) as ArtifactType[]).map((type) => {
            const items = groupedArtifacts[type];
            const cfg = typeConfig[type];
            const Icon = cfg.icon;

            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-medium text-(--color-text-muted) uppercase tracking-wider">
                  <Icon className={`h-3 w-3 ${cfg.color}`} />
                  <span>{cfg.label}s</span>
                  <span className="ml-auto text-[9px] opacity-60">({items.length})</span>
                </div>

                <div className="space-y-0.5 pl-1">
                  {items.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => setSelectedId(art.id)}
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-all flex items-center justify-between gap-2 border ${
                        art.id === selectedId
                          ? "bg-(--color-primary-muted) text-(--color-primary) border-(--color-primary)/30 font-medium"
                          : "border-transparent text-(--color-text-secondary) hover:bg-(--color-bg-elevated)"
                      }`}
                    >
                      <span className="truncate flex-1">{art.title.split(" — ").pop() || art.title}</span>
                      <span className="text-[9px] text-(--color-text-disabled) shrink-0">
                        v{art.version}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right Content Pane: Markdown Document Viewer ───────────────── */}
      <div className="rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) overflow-hidden flex flex-col min-h-[500px]">
        {activeArtifact ? (
          <>
            {/* Header / Actions strip */}
            <div className="border-b border-(--color-border-subtle) bg-(--color-bg-elevated) px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-(--color-text-primary) truncate">
                  {activeArtifact.title}
                </h1>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-(--color-text-muted) flex-wrap">
                  {activeArtifact.agent && (
                    <span className="flex items-center gap-1">
                      <Bot className="h-3 w-3 text-(--color-primary)" />
                      Created by {activeArtifact.agent.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(activeArtifact.createdAt)}
                  </span>
                  <span>
                    Size: {(activeArtifact.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="h-8">
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-(--color-success)" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy Content
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="h-8">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download MD
                </Button>
              </div>
            </div>

            {/* Document display area */}
            <div className="flex-1 p-5 overflow-y-auto max-h-[600px] bg-(--color-bg-surface) prose prose-invert max-w-none">
              {renderCustomMarkdown(activeArtifact.content)}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <Info className="h-10 w-10 text-(--color-text-disabled) mb-4" />
            <h3 className="text-sm font-semibold text-(--color-text-primary) mb-1">
              No artifact selected
            </h3>
            <p className="text-xs text-(--color-text-muted)">
              Choose an artifact file from the category menu on the left.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
