import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";

interface ActivityPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { id } = await params;

  const mission = await db.mission.findUnique({
    where: { id },
    include: {
      agents: {
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!mission) notFound();

  const allMessages = mission.agents
    .flatMap((a) =>
      a.messages.map((m) => ({
        ...m,
        agentName: a.name,
        createdAt: m.createdAt.toISOString(),
      }))
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="flex h-full flex-col animate-fade-up max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900">Agent Activity</h1>
        <p className="mt-1.5 text-xs text-neutral-500">{mission.title}</p>
      </div>
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <AgentActivityFeed
          missionId={id}
          initialMessages={allMessages}
          isRunning={mission.status === "RUNNING"}
        />
      </div>
    </div>
  );
}
