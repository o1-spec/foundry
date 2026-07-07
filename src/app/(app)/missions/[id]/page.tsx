import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MissionDetailClient } from "@/components/mission/MissionDetailClient";
import type { Metadata } from "next";

interface MissionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MissionPageProps): Promise<Metadata> {
  const { id } = await params;
  const mission = await db.mission.findUnique({ where: { id }, select: { title: true } });
  return {
    title: mission ? `${mission.title} — Foundry` : "Mission — Foundry",
  };
}

export default async function MissionDetailPage({ params }: MissionPageProps) {
  const { id } = await params;

  const mission = await db.mission.findUnique({
    where: { id },
    include: {
      agents: {
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
      tasks:     { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] },
      artifacts: { orderBy: { createdAt: "desc" } },
      runtimeMetrics: true,
    },
  });

  if (!mission) notFound();

  return (
    <div className="h-full animate-fade-up">
      <MissionDetailClient mission={mission} />
    </div>
  );
}
