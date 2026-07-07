import { NextResponse } from "next/server";
import { retryAgent } from "@/lib/orchestrator";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    await retryAgent(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = (error as Error).message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
