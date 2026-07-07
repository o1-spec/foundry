"use client";

import Link from "next/link";
import { ArrowRight, Bot, Zap, BarChart3, GitBranch, Shield, Globe, Compass, Code, Terminal, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Bot,
    title: "Specialist Agent Teams",
    description: "Assemble purpose-built agents — researchers, writers, planners, critics — that collaborate like a real team.",
  },
  {
    icon: GitBranch,
    title: "Execution Graph",
    description: "Visualise the entire agent pipeline as a live, interactive graph. See who is working on what, in real-time.",
  },
  {
    icon: Zap,
    title: "BTL Runtime",
    description: "Powered by the BTL Runtime, an OpenAI-compatible inference engine built for speed and scale.",
  },
  {
    icon: BarChart3,
    title: "Runtime Metrics",
    description: "Track token usage, latency, and cost per agent and per mission with a full metrics dashboard.",
  },
  {
    icon: Shield,
    title: "Structured Deliverables",
    description: "Every agent produces typed artifacts — documents, code, analyses, reports — stored and versioned.",
  },
  {
    icon: Globe,
    title: "OpenAI Compatible",
    description: "Drop in any OpenAI-compatible model endpoint. No lock-in.",
  },
];

interface StickerProps {
  children: React.ReactNode;
  className?: string;
  rotation?: string;
}

function Sticker({ children, className = "", rotation = "rotate-0" }: StickerProps) {
  return (
    <div className={`absolute pointer-events-none select-none transition-all duration-300 hover:scale-105 ${className} ${rotation}`}>
      <div className="relative border border-dashed border-neutral-300/80 p-2 bg-neutral-100/10 rounded-xl">
        {/* Resize Handles */}
        <span className="absolute -top-1 -left-1 w-1.5 h-1.5 border border-neutral-400 bg-white" />
        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 border border-neutral-400 bg-white" />
        <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 border border-neutral-400 bg-white" />
        <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border border-neutral-400 bg-white" />

        {/* Actual Content Card */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-md shadow-neutral-200/40 text-left min-w-[200px]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-linear-to-b from-bg-base via-[#FCFAF7] to-[#F5F2EC] text-neutral-900 font-sans">
      {/* Subtle Dot Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(circle, #dfddd9 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Navigation Header */}
      <header className="relative z-20 flex items-center justify-between border-b border-neutral-200/60 bg-white/60 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--color-primary) shadow-sm shadow-pink-500/10">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-tight text-neutral-900">Foundry</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50 rounded-full">
              Dashboard
            </Button>
          </Link>
          <Link href="/missions/new">
            <Button size="sm" className="bg-(--color-primary) text-white hover:bg-(--color-primary-hover) rounded-full text-xs px-4 shadow-sm shadow-pink-500/10">
              Start a mission <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center px-6 pb-20 pt-24 text-center min-h-[580px] justify-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-white/80 px-3 py-1 text-xs text-neutral-700 font-medium mb-6 shadow-xs animate-fade-up">
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            Powered by BTL Runtime
          </div>

          {/* Title */}
          <h1 className="font-serif text-5xl font-semibold tracking-tight text-neutral-900 md:text-7xl leading-[1.08] max-w-3xl animate-fade-up">
            Coordinate AI agent <br />
            teams, <span className="italic font-normal font-serif">openly</span>.
          </h1>

          {/* Pitch */}
          <p className="mt-6 max-w-lg text-base text-neutral-500 leading-relaxed font-sans animate-fade-up">
            Foundry is an open canvas for collaborative specialist agents. Define your objective, orchestrate execution graphs, and watch them deliver real results.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-up z-20">
            <Link href="/missions/new">
              <Button size="lg" className="min-w-[180px] bg-(--color-primary) text-white hover:bg-(--color-primary-hover) rounded-full shadow-lg shadow-pink-500/20">
                <Zap className="h-4 w-4" /> Start a mission
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="min-w-[160px] border-neutral-300 bg-white/80 hover:bg-neutral-50 text-neutral-900 rounded-full">
                View dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-neutral-400 animate-fade-up">
            Zero setup required. Sandbox comes pre-loaded with mock operations.
          </p>

          {/* Floating Sticker Canvas Objects */}
          <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
            {/* Top Left: Planner Sticker */}
            <Sticker className="top-12 left-8" rotation="-rotate-6">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-100 text-violet-600">
                  <Compass className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Planner Agent</span>
              </div>
              <p className="text-[11px] font-semibold text-neutral-800">Generated 7 pipeline tasks</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-neutral-500">Status: Completed</span>
              </div>
            </Sticker>

            {/* Middle Left: Document preview sticker */}
            <Sticker className="top-48 left-16" rotation="rotate-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="h-3 w-3 text-neutral-400" />
                <span className="text-[9px] font-mono text-neutral-400">PRD.md</span>
              </div>
              <p className="text-[10px] font-bold text-neutral-800 mb-1">Competitive pricing matrix</p>
              <div className="space-y-1">
                <div className="h-1 w-20 rounded bg-neutral-200" />
                <div className="h-1 w-16 rounded bg-neutral-200" />
                <div className="h-1 w-24 rounded bg-neutral-200" />
              </div>
            </Sticker>

            {/* Bottom Left: Engineer / Code Sticker */}
            <Sticker className="bottom-20 left-12" rotation="-rotate-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Code className="h-3 w-3 text-amber-500" />
                <span className="text-[9px] font-mono text-amber-600">server.ts</span>
              </div>
              <pre className="text-[9px] font-mono bg-neutral-50 p-1.5 border border-neutral-100 rounded text-neutral-600">
                {`const client = new BTLClient({\n  apiKey: process.env.BTL\n});`}
              </pre>
            </Sticker>

            {/* Top Right: Graph Connection Sticker */}
            <Sticker className="top-10 right-8" rotation="rotate-6">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Critic Review</span>
              </div>
              <p className="text-[11px] font-semibold text-neutral-800">Final deliverables approved</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-neutral-500">100% complete</span>
              </div>
            </Sticker>

            {/* Middle Right: Runtime Metric Sticker */}
            <Sticker className="top-44 right-16" rotation="-rotate-6">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                  <Zap className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Runtime Telemetry</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4 text-[9px]">
                  <span className="text-neutral-500">Cache Hits:</span>
                  <span className="font-bold text-neutral-800">100%</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[9px]">
                  <span className="text-neutral-500">Savings:</span>
                  <span className="font-bold text-emerald-600">+$42.50</span>
                </div>
              </div>
            </Sticker>

            {/* Bottom Right: Execution node Sticker */}
            <Sticker className="bottom-24 right-10" rotation="rotate-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold text-neutral-800">Analyst Agent</span>
              </div>
              <p className="text-[9px] text-neutral-400 leading-tight">Identifying SaaS pricing pattern discrepancies...</p>
            </Sticker>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="px-6 pb-28 pt-8 max-w-5xl mx-auto">
          <div className="border-t border-neutral-200/80 pt-16">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900 text-center mb-12">
              Everything you need to run AI agent pipelines
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-xs p-6 transition-all duration-200 hover:border-neutral-400/60 hover:bg-white"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 transition-colors group-hover:bg-black group-hover:text-white">
                    <Icon className="h-4 w-4 text-neutral-700 transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-neutral-900">{title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="px-6 pb-28 text-center max-w-5xl mx-auto">
          <div className="rounded-3xl border border-neutral-200/80 bg-linear-to-r from-neutral-50 via-white to-neutral-50 p-12 shadow-sm">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900 mb-3">
              Ready to run your first mission?
            </h2>
            <p className="mb-8 max-w-md mx-auto text-sm text-neutral-500">
              Set up takes 60 seconds. Define your objective, pick your agents, and let Foundry handle the complexity.
            </p>
            <Link href="/missions/new">
              <Button size="lg" className="bg-black text-white hover:bg-neutral-800 rounded-full shadow-lg shadow-neutral-900/10">
                <Zap className="h-4 w-4" /> Start a mission now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-200/60 bg-white/30 px-8 py-6">
        <div className="flex items-center justify-between text-[10px] text-neutral-400">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-neutral-700" />
            <span className="font-semibold text-neutral-700">Foundry</span>
          </div>
          <p>AI execution platform — built on BTL Runtime</p>
        </div>
      </footer>
    </div>
  );
}
