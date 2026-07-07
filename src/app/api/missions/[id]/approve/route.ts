import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const mission = await db.mission.update({
      where: { id },
      data: { approved: true },
    });

    await db.agentMessage.create({
      data: {
        missionId: id,
        role: "SYSTEM",
        type: "STATUS",
        content: `[Approved] User approved the final deliverables package for mission: "${mission.title}"`,
      },
    });

    return NextResponse.json({ success: true, mission });
  } catch (error) {
    const message = (error as Error).message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
