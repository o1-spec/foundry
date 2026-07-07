import { NextRequest, NextResponse } from "next/server";
import { executeMissionPipeline } from "@/lib/orchestrator";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Trigger the orchestrator pipeline in the background
  executeMissionPipeline(id).catch((err) => {
    console.error(`[Background Orchestrator Error for Mission ${id}]:`, err);
  });

  return NextResponse.json({ message: "Orchestration pipeline triggered" }, { status: 202 });
}
