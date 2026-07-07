import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { ArtifactViewer } from "@/components/artifacts/ArtifactViewer";

interface DeliverablesPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeliverablesPage({ params }: DeliverablesPageProps) {
  const { id } = await params;

  const mission = await db.mission.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!mission) notFound();

  const artifacts = await db.artifact.findMany({
    where: { missionId: id },
    include: { agent: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-fade-up max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900">Artifact Console</h1>
          <p className="mt-1.5 text-xs text-neutral-500">{mission.title}</p>
        </div>
        <Badge variant="secondary">
          {artifacts.length} file{artifacts.length !== 1 ? "s" : ""} generated
        </Badge>
      </div>

      {artifacts.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white py-16 text-center shadow-xs">
          <p className="text-xs text-neutral-500">
            Run the mission to generate output artifacts.
          </p>
        </div>
      ) : (
        <ArtifactViewer initialArtifacts={artifacts} />
      )}
    </div>
  );
}
