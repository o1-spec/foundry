"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MISSION_TYPES = [
  "Software Product",
  "Research",
  "Business Strategy",
  "Marketing Campaign",
  "General Mission",
];

export function CreateMissionForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Software Product");
  const [constraints, setConstraints] = useState("");
  const [expectedDeliverables, setExpectedDeliverables] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          constraints: constraints || null,
          expectedDeliverables: expectedDeliverables || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create mission");
      }

      const mission = await res.json();
      router.push(`/missions/${mission.id}`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      {/* ── Step Indicators ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between border border-neutral-200 bg-white/70 backdrop-blur-xs p-3.5 rounded-2xl shadow-2xs">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1 justify-center last:flex-initial">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                s === step
                  ? "bg-black text-white ring-4 ring-neutral-100"
                  : s < step
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-neutral-50 text-neutral-400 border border-neutral-200/60"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
            <span
              className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${
                s === step
                  ? "text-neutral-950"
                  : s < step
                  ? "text-emerald-600"
                  : "text-neutral-400"
              }`}
            >
              {s === 1 ? "Objective" : s === 2 ? "Requirements" : "Launch"}
            </span>
            {s < 3 && <div className="hidden sm:block h-px flex-1 max-w-[60px] bg-neutral-200 mx-2" />}
          </div>
        ))}
      </div>

      {/* ── Form Card ────────────────────────────────────────────────── */}
      <Card className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Step 1: Definition */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-semibold text-neutral-900">
                Define your mission objective
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Provide a clear title, description, and classification type.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Mission title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Launch SaaS developer portal MVP"
                  className="rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white transition-all text-xs h-10 px-3.5 focus:border-black focus:ring-black/5"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Mission Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white px-3.5 py-2 text-xs text-neutral-800 outline-hidden transition-all focus:border-black focus:ring-4 focus:ring-neutral-100"
                >
                  {MISSION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Objective Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the target objective you want the agents to collaborate on..."
                  className="min-h-[140px] rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white transition-all text-xs p-3.5 focus:border-black focus:ring-black/5 leading-relaxed"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={title.length < 3 || description.length < 10}
              className="w-full bg-black text-white hover:bg-neutral-800 rounded-full h-10 text-xs font-semibold shadow-md shadow-neutral-900/5 transition-all mt-2"
            >
              Configure Requirements <Plus className="ml-1.5 h-3.5 w-3.5" strokeWidth={2.5} />
            </Button>
          </div>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-semibold text-neutral-900">
                Establish rules &amp; deliverables
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Help focus agent execution by declaring explicit guidelines.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="constraints" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Constraints (Optional)</Label>
                <Textarea
                  id="constraints"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g. Budget limit $500, must support offline sync, use Next.js 16..."
                  className="min-h-[100px] rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white transition-all text-xs p-3.5 focus:border-black focus:ring-black/5 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deliverables" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Expected Deliverables (Optional)</Label>
                <Textarea
                  id="deliverables"
                  value={expectedDeliverables}
                  onChange={(e) => setExpectedDeliverables(e.target.value)}
                  placeholder="e.g. Product design schemas, sample components, validation QA checklist..."
                  className="min-h-[100px] rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white transition-all text-xs p-3.5 focus:border-black focus:ring-black/5 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full h-10 text-xs font-semibold border border-neutral-200 hover:bg-neutral-50 transition-all bg-white text-neutral-700"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-black text-white hover:bg-neutral-800 rounded-full h-10 text-xs font-semibold shadow-md shadow-neutral-900/5 transition-all"
              >
                Review details <Zap className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Launch */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-semibold text-neutral-900">
                Launch Agent pipeline
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Review details before firing orchestrator background workers.
              </p>
            </div>

            <Card className="bg-neutral-50/50 border border-neutral-200/70 rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 mb-1.5">
                    General Details
                  </p>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <p className="text-xs font-bold text-neutral-900">
                      {title}
                    </p>
                    <Badge className="bg-black/5 text-neutral-800 border border-neutral-200 hover:bg-black/5 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                      {type}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                    {description}
                  </p>
                </div>

                {(constraints || expectedDeliverables) && (
                  <div className="grid gap-4 pt-3 border-t border-neutral-200/60 sm:grid-cols-2">
                    {constraints && (
                      <div>
                        <p className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
                          Constraints
                        </p>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {constraints}
                        </p>
                      </div>
                    )}
                    {expectedDeliverables && (
                      <div>
                        <p className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
                          Deliverables Target
                        </p>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {expectedDeliverables}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50/50 px-3.5 py-2.5 text-xs text-rose-600 font-medium">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
                className="flex-1 rounded-full h-10 text-xs font-semibold border border-neutral-200 hover:bg-neutral-50 transition-all bg-white text-neutral-700"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-black text-white hover:bg-neutral-800 rounded-full h-10 text-xs font-semibold shadow-md shadow-neutral-900/5 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Starting pipeline...
                  </>
                ) : (
                  <>
                    <Zap className="mr-1.5 h-3.5 w-3.5" /> Launch Mission
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
