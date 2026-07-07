import { CreateMissionForm } from "@/components/mission/CreateMissionForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Mission — Foundry",
  description: "Create a new AI mission and assemble your agent team.",
};

export default function NewMissionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-(--color-text-primary)">New Mission</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          Define your objective and assemble a team of specialist AI agents to execute it.
        </p>
      </div>
      <CreateMissionForm />
    </div>
  );
}
