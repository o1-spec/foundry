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
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-up">
      {/* Step indicators */}
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                s === step
                  ? "bg-(--color-primary) text-white"
                  : s < step
                  ? "bg-(--color-primary)/30 text-(--color-primary)"
                  : "bg-(--color-bg-elevated) text-(--color-text-muted)"
              }`}
            >
              {s}
            </div>
            <span
              className={`text-xs ${
                s === step
                  ? "text-(--color-text-primary) font-medium"
                  : "text-(--color-text-muted)"
              }`}
            >
              {s === 1 ? "Objective" : s === 2 ? "Requirements" : "Launch"}
            </span>
            {s < 3 && <div className="h-px w-8 bg-(--color-border-default)" />}
          </div>
        ))}
      </div>

      {/* Step 1: Definition */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-(--color-text-primary)">
              Define your mission objective
            </h2>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              Provide a clear title, description, and classification type.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Mission title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Launch SaaS developer portal MVP"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">Mission Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-(--color-border-default) bg-(--color-bg-surface) px-3 py-1 text-sm text-(--color-text-primary) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20"
              >
                {MISSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Objective Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the target objective you want the agents to collaborate on..."
                className="min-h-[140px]"
              />
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={title.length < 3 || description.length < 10}
            className="w-full"
          >
            Configure Requirements <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Step 2: Requirements */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-(--color-text-primary)">
              Establish rules &amp; deliverables
            </h2>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              Help focus agent execution by declaring explicit guidelines.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="constraints">Constraints (Optional)</Label>
              <Textarea
                id="constraints"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. Budget limit $500, must support offline sync, use Next.js 16..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deliverables">Expected Deliverables (Optional)</Label>
              <Textarea
                id="deliverables"
                value={expectedDeliverables}
                onChange={(e) => setExpectedDeliverables(e.target.value)}
                placeholder="e.g. Product design schemas, sample components, validation QA checklist..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              Review details <Zap className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Launch */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-(--color-text-primary)">
              Launch Agent pipeline
            </h2>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              Review details before firing orchestrator background workers.
            </p>
          </div>

          <Card className="bg-(--color-bg-surface)">
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-(--color-text-muted) mb-1">
                  General Details
                </p>
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-(--color-text-primary)">
                    {title}
                  </p>
                  <Badge variant="secondary">{type}</Badge>
                </div>
                <p className="text-xs text-(--color-text-muted) leading-relaxed">
                  {description}
                </p>
              </div>

              {(constraints || expectedDeliverables) && (
                <div className="grid gap-3 pt-2 border-t border-(--color-border-subtle) sm:grid-cols-2">
                  {constraints && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-(--color-text-muted) mb-0.5">
                        Constraints
                      </p>
                      <p className="text-xs text-(--color-text-secondary) leading-relaxed">
                        {constraints}
                      </p>
                    </div>
                  )}
                  {expectedDeliverables && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-(--color-text-muted) mb-0.5">
                        Deliverables Target
                      </p>
                      <p className="text-xs text-(--color-text-secondary) leading-relaxed">
                        {expectedDeliverables}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <p className="rounded-lg border border-(--color-error)/20 bg-(--color-error)/5 px-3 py-2 text-xs text-(--color-error)">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1" disabled={loading}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Starting pipeline...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" /> Launch Mission
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
