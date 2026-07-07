import { NextResponse } from "next/server";
import { reviseAgent } from "@/lib/orchestrator";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { revisionPrompt } = body;

    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }
    if (!revisionPrompt) {
      return NextResponse.json({ error: "Revision prompt is required" }, { status: 400 });
    }

    await reviseAgent(id, revisionPrompt);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = (error as Error).message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
