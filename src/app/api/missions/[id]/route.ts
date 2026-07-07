import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UpdateMissionSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const mission = await db.mission.findUnique({
      where: { id },
      include: {
        agents: {
          include: {
            messages: { orderBy: { createdAt: "asc" }, take: 50 },
          },
        },
        tasks:    { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] },
        messages: { orderBy: { createdAt: "asc" } },
        artifacts: { orderBy: { createdAt: "desc" } },
        runtimeMetrics: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }
    return NextResponse.json(mission);
  } catch (error) {
    console.error("[GET /api/missions/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch mission" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = UpdateMissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const mission = await db.mission.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(mission);
  } catch (error) {
    console.error("[PATCH /api/missions/[id]]", error);
    return NextResponse.json({ error: "Failed to update mission" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.mission.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/missions/[id]]", error);
    return NextResponse.json({ error: "Failed to delete mission" }, { status: 500 });
  }
}
