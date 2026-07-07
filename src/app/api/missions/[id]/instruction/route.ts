import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Instruction content is required" }, { status: 400 });
    }

    const msg = await db.agentMessage.create({
      data: {
        missionId: id,
        role: "USER",
        type: "LOG",
        content,
      },
    });

    return NextResponse.json({ success: true, message: msg });
  } catch (error) {
    const message = (error as Error).message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
