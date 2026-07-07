import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Server, Cpu, Key, Database } from "lucide-react";

export const metadata = {
  title: "Settings — Foundry",
  description: "Configure workspace settings and AI model tiers.",
};

export default function SettingsPage() {
  // Read environments (or fallback values safely)
  const baseUrl = process.env.BTL_RUNTIME_BASE_URL || "https://api.badtheorylabs.com/v1";
  const apiKey = process.env.BTL_RUNTIME_API_KEY || "";
  const cheapModel = process.env.BTL_CHEAP_MODEL || "gpt-4o-mini";
  const strongModel = process.env.BTL_STRONG_MODEL || "gpt-4o";
  const embeddingModel = process.env.BTL_EMBEDDING_MODEL || "openai/text-embedding-3-small";

  // Mask the API key for security
  const maskedKey = apiKey 
    ? `${apiKey.slice(0, 10)}...${apiKey.slice(-6)}` 
    : "Not configured";

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900">Workspace settings</h1>
        <p className="text-xs text-neutral-400 mt-0.5">Review active integrations, model tiers, and database profiles.</p>
      </div>

      <div className="space-y-4">
        {/* BTL Runtime Gateway Configuration */}
        <Card className="bg-white border-neutral-200 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4.5 w-4.5 text-neutral-600" />
              <div>
                <CardTitle className="text-sm font-bold text-neutral-900">BTL Runtime gateway</CardTitle>
                <CardDescription className="text-[11px] text-neutral-400">Endpoint configuration for the shared-savings optimization layer.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-neutral-700">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-3">
              <span className="font-bold text-neutral-500">Gateway URL</span>
              <span className="font-mono text-neutral-800 bg-neutral-50 border border-neutral-200/50 px-2 py-0.5 rounded text-[11px] select-all">
                {baseUrl}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold text-neutral-500">API Key</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-neutral-800 bg-neutral-50 border border-neutral-200/50 px-2 py-0.5 rounded text-[11px]">
                  {maskedKey}
                </span>
                {apiKey && <Badge variant="secondary">Active</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model Tiers Configuration */}
        <Card className="bg-white border-neutral-200 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-neutral-600" />
              <div>
                <CardTitle className="text-sm font-bold text-neutral-900">AI Model tiers</CardTitle>
                <CardDescription className="text-[11px] text-neutral-400">Allocated model strings utilized during step execution.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-neutral-700">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-3">
              <span className="font-bold text-neutral-500">Strong Model (Reasoning & Code)</span>
              <span className="font-mono text-neutral-800 bg-neutral-50 border border-neutral-200/50 px-2 py-0.5 rounded text-[11px]">
                {strongModel}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-3">
              <span className="font-bold text-neutral-500">Cheap Model (Router & Extraction)</span>
              <span className="font-mono text-neutral-800 bg-neutral-50 border border-neutral-200/50 px-2 py-0.5 rounded text-[11px]">
                {cheapModel}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold text-neutral-500">Embedding Model</span>
              <span className="font-mono text-neutral-800 bg-neutral-50 border border-neutral-200/50 px-2 py-0.5 rounded text-[11px]">
                {embeddingModel}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Database Connection Profile */}
        <Card className="bg-white border-neutral-200 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-neutral-600" />
              <div>
                <CardTitle className="text-sm font-bold text-neutral-900">Database profile</CardTitle>
                <CardDescription className="text-[11px] text-neutral-400">Underlying database engine settings and telemetry logging pool.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-neutral-700">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-3">
              <span className="font-bold text-neutral-500">Database Engine</span>
              <span className="font-semibold text-neutral-800">PostgreSQL</span>
            </div>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold text-neutral-500">PgBouncer Connection Pooling</span>
              <Badge variant="success">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
