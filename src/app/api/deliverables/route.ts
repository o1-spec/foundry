import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get("missionId");

  try {
    const artifacts = await db.artifact.findMany({
      where: missionId ? { missionId } : undefined,
      include: { agent: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(artifacts);
  } catch (error) {
    console.error("[GET /api/artifacts]", error);
    return NextResponse.json({ error: "Failed to fetch artifacts" }, { status: 500 });
  }
}
