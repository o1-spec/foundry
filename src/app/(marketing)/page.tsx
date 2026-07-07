import Link from "next/link";
import { ArrowRight, Bot, Zap, BarChart3, GitBranch, Shield, Globe } from "lucide-react";
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

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-(--color-bg-base)">
      {/* Gradient mesh background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-(--color-primary) opacity-[0.08] blur-[120px]" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-800 opacity-[0.06] blur-[100px]" />
        <div className="absolute top-1/4 -right-40 h-[400px] w-[400px] rounded-full bg-violet-900 opacity-[0.06] blur-[100px]" />
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between border-b border-(--color-border-subtle) px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--color-primary)">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-tight text-(--color-text-primary)">Foundry</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          <Link href="/missions/new">
            <Button size="sm">
              Start a mission <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="flex flex-col items-center px-6 pb-24 pt-28 text-center">
          <Badge variant="secondary" className="mb-6">
            <Zap className="h-2.5 w-2.5 text-(--color-primary)" />
            Powered by BTL Runtime
          </Badge>

          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.1] tracking-tight text-(--color-text-primary) md:text-6xl lg:text-7xl">
            <span className="block">AI agents that</span>
            <span
              className="block bg-linear-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent animate-gradient"
            >
              execute together
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base text-(--color-text-secondary) leading-relaxed">
            Foundry is an AI execution platform where you define a mission and a team of specialist agents collaborates to deliver real results — plans, documents, code, analyses.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/missions/new">
              <Button size="lg" className="min-w-[180px] shadow-xl shadow-(--color-primary)/20">
                <Zap className="h-4 w-4" />
                Run your first mission
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="min-w-[160px]">
                View dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Terminal-style preview */}
          <div className="glass mt-16 w-full max-w-2xl rounded-2xl p-px shadow-2xl shadow-black/50 animate-fade-up">
            <div className="rounded-2xl bg-(--color-bg-surface) p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-(--color-error)/60" />
                  <span className="h-3 w-3 rounded-full bg-warning/60" />
                  <span className="h-3 w-3 rounded-full bg-(--color-success)/60" />
                </div>
                <span className="ml-2 text-[10px] text-(--color-text-muted)">Mission: Competitive SaaS Pricing Analysis</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {[
                  { agent: "Researcher", status: "DONE", msg: "Gathered 14 competitor pricing pages" },
                  { agent: "Analyst", status: "WORKING", msg: "Identifying pricing patterns…" },
                  { agent: "Writer", status: "IDLE", msg: "Waiting for analyst output" },
                  { agent: "Critic", status: "IDLE", msg: "Ready to review" },
                ].map((row) => (
                  <div key={row.agent} className="flex items-center gap-3 rounded-lg bg-(--color-bg-elevated) px-3 py-2">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${row.status === "DONE" ? "bg-(--color-success)" :
                          row.status === "WORKING" ? "bg-(--color-primary) animate-pulse" :
                            "bg-(--color-text-disabled)"
                        }`}
                    />
                    <span className="w-20 shrink-0 text-(--color-primary)">{row.agent}</span>
                    <span className="text-(--color-text-muted)">{row.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-bold text-(--color-text-primary)">
              Everything you need to run AI missions at scale
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="glass group rounded-xl p-5 transition-all duration-200 hover:border-(--color-border-strong) hover:bg-(--color-bg-elevated)"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-primary-muted) transition-colors group-hover:bg-(--color-primary)/20">
                    <Icon className="h-4 w-4 text-(--color-primary)" />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-(--color-text-primary)">{title}</h3>
                  <p className="text-xs text-(--color-text-muted) leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-28 text-center">
          <div className="mx-auto max-w-xl glass rounded-2xl p-10">
            <h2 className="mb-3 text-2xl font-bold text-(--color-text-primary)">
              Ready to run your first mission?
            </h2>
            <p className="mb-8 text-sm text-(--color-text-muted)">
              Set up takes 60 seconds. Define your objective, pick your agents, and let Foundry do the rest.
            </p>
            <Link href="/missions/new">
              <Button size="lg" className="shadow-xl shadow-(--color-primary)/20">
                <Zap className="h-4 w-4" /> Get started free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-(--color-border-subtle) px-8 py-6">
        <div className="flex items-center justify-between text-[10px] text-(--color-text-muted)">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-(--color-primary)" />
            <span className="font-semibold text-(--color-text-secondary)">Foundry</span>
          </div>
          <p>AI execution platform — built on BTL Runtime</p>
        </div>
      </footer>
    </div>
  );
}
