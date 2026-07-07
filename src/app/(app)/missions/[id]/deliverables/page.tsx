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
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-(--color-text-primary)">Artifact Console</h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">{mission.title}</p>
        </div>
        <Badge variant="secondary">
          {artifacts.length} file{artifacts.length !== 1 ? "s" : ""} generated
        </Badge>
      </div>

      {artifacts.length === 0 ? (
        <div className="rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) py-16 text-center">
          <p className="text-xs text-(--color-text-muted)">
            Run the mission to generate output artifacts.
          </p>
        </div>
      ) : (
        <ArtifactViewer initialArtifacts={artifacts} />
      )}
    </div>
  );
}
