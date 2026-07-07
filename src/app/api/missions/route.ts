import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateMissionSchema } from "@/lib/validations";
import { executeMissionPipeline } from "@/lib/orchestrator";

export async function GET() {
  try {
    const missions = await db.mission.findMany({
      include: {
        _count: { select: { agents: true, artifacts: true, tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(missions);
  } catch (error) {
    console.error("[GET /api/missions]", error);
    return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateMissionSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { title, description, type, constraints, expectedDeliverables, agents } = parsed.data;

    const DEFAULT_AGENTS = [
      { name: "Planner Agent",    role: "Planner",         model: process.env.BTL_STRONG_MODEL || "gpt-4o" },
      { name: "Research Agent",   role: "Researcher",      model: process.env.BTL_STRONG_MODEL || "gpt-4o" },
      { name: "Product Agent",    role: "Product Manager", model: process.env.BTL_STRONG_MODEL || "gpt-4o" },
      { name: "Architect Agent",  role: "Architect",       model: process.env.BTL_STRONG_MODEL || "gpt-4o" },
      { name: "Engineer Agent",   role: "Engineer",        model: process.env.BTL_STRONG_MODEL || "gpt-4o" },
      { name: "QA Agent",         role: "QA Specialist",   model: process.env.BTL_STRONG_MODEL || "gpt-4o" },
      { name: "Reviewer Agent",   role: "Lead Reviewer",   model: process.env.BTL_STRONG_MODEL || "gpt-4o" },
    ];

    const agentsToCreate = agents && agents.length > 0 ? agents : DEFAULT_AGENTS;

    const mission = await db.mission.create({
      data: {
        title,
        description,
        type,
        constraints: constraints || null,
        expectedDeliverables: expectedDeliverables || null,
        status: "PENDING",
        progress: 0,
        agents: {
          create: agentsToCreate.map((a) => ({
            name:   a.name,
            role:   a.role,
            model:  a.model,
            status: "IDLE",
          })),
        },
      },
      include: { agents: true },
    });

    // Trigger the orchestrator pipeline in the background
    executeMissionPipeline(mission.id).catch((err) => {
      console.error(`Background orchestrator execution failed for mission ${mission.id}:`, err);
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error("[POST /api/missions]", error);
    return NextResponse.json({ error: "Failed to create mission" }, { status: 500 });
  }
}
