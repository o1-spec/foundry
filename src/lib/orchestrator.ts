import { db } from "./db";
import {
  runPlannerAgent,
  runResearchAgent,
  runProductAgent,
  runArchitectAgent,
  runEngineerAgent,
  runQAAgent,
  runReviewerAgent,
  type AgentExecutionOptions,
} from "./agents";
import { type AgentResponse } from "./runtime";
import {
  type Mission,
  type Agent,
  type Artifact,
  type AgentMessage,
  type MissionTask,
  type ArtifactType,
  type AgentStatus,
  type TaskStatus,
} from "@prisma/client";

export interface StageDefinition {
  id: string;
  name: string;
  roleKeywords: string[];
  runner: (options: AgentExecutionOptions) => Promise<AgentResponse>;
  artifactType: ArtifactType;
  artifactTitle: string;
  progressAfter: number;
}

export const STAGES: StageDefinition[] = [
  {
    id: "planner",
    name: "Planning Stage",
    roleKeywords: ["planner", "strategy", "timeline"],
    runner: runPlannerAgent,
    artifactType: "DOCUMENT",
    artifactTitle: "Milestones & Task Roadmap",
    progressAfter: 15,
  },
  {
    id: "researcher",
    name: "Research Stage",
    roleKeywords: ["researcher", "analyst", "domain"],
    runner: runResearchAgent,
    artifactType: "ANALYSIS",
    artifactTitle: "Domain & Competitive Intelligence Report",
    progressAfter: 35,
  },
  {
    id: "product",
    name: "Product Design Stage",
    roleKeywords: ["product", "writer", "manager", "pm"],
    runner: runProductAgent,
    artifactType: "DOCUMENT",
    artifactTitle: "Product Requirements Document (PRD)",
    progressAfter: 50,
  },
  {
    id: "architect",
    name: "System Architecture Stage",
    roleKeywords: ["architect", "designer", "infra"],
    runner: runArchitectAgent,
    artifactType: "DIAGRAM",
    artifactTitle: "System & API Blueprint",
    progressAfter: 65,
  },
  {
    id: "engineer",
    name: "Engineering Stage",
    roleKeywords: ["engineer", "coder", "developer"],
    runner: runEngineerAgent,
    artifactType: "CODE",
    artifactTitle: "Technical Implementation Mocks",
    progressAfter: 80,
  },
  {
    id: "qa",
    name: "Quality Assurance Stage",
    roleKeywords: ["qa", "critic", "tester"],
    runner: runQAAgent,
    artifactType: "REPORT",
    artifactTitle: "Validation Checklist & QA Scenarios",
    progressAfter: 90,
  },
  {
    id: "reviewer",
    name: "Final Review Stage",
    roleKeywords: ["reviewer", "lead", "editor"],
    runner: runReviewerAgent,
    artifactType: "REPORT",
    artifactTitle: "Unified Deliverables Package",
    progressAfter: 100,
  },
];

/**
 * Finds an agent in the mission matching the role keywords for a stage
 */
function findAgentForStage(agents: Agent[], stage: StageDefinition): Agent | undefined {
  return agents.find((agent) => {
    const roleLower = agent.role.toLowerCase();
    const nameLower = agent.name.toLowerCase();
    return stage.roleKeywords.some(
      (kw) => roleLower.includes(kw) || nameLower.includes(kw)
    );
  });
}

/**
 * Runs a single orchestrator stage, updating task, agent, progress status,
 * and saving deliverables, metrics, and event messages.
 */
async function runStage({
  mission,
  agent,
  stage,
  onMessage,
}: {
  mission: Mission & { agents: Agent[]; tasks: MissionTask[]; artifacts: Artifact[]; messages: AgentMessage[] };
  agent: Agent;
  stage: StageDefinition;
  onMessage?: (event: string, data: any) => void;
}): Promise<string> {
  // 1. Update Agent to RUNNING (or RETRYING if it failed previously)
  const isRetry = agent.status === "FAILED" || agent.status === "ERROR";
  await db.agent.update({
    where: { id: agent.id },
    data: {
      status: isRetry ? "RETRYING" : "RUNNING",
      currentTask: `Preparing outputs for ${stage.name}...`,
      errorMessage: null,
    },
  });

  // 2. Find or Create Task record
  let task = mission.tasks.find((t) => t.title === stage.name);
  if (!task) {
    task = await db.missionTask.create({
      data: {
        missionId: mission.id,
        agentId: agent.id,
        title: stage.name,
        description: `Execute specialized agent pipeline logic for ${stage.name}`,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });
  } else {
    task = await db.missionTask.update({
      where: { id: task.id },
      data: { status: "RUNNING", agentId: agent.id, startedAt: new Date() },
    });
  }

  // 3. Dispatch Status message
  const statusMsg = await db.agentMessage.create({
    data: {
      missionId: mission.id,
      agentId: agent.id,
      role: "ASSISTANT",
      type: "STATUS",
      content: `${agent.name} is initiating the ${stage.name}...`,
    },
  });
  if (onMessage) {
    onMessage("message", {
      id: statusMsg.id,
      agentId: agent.id,
      agentName: agent.name,
      role: "ASSISTANT",
      type: "STATUS",
      content: statusMsg.content,
      createdAt: statusMsg.createdAt.toISOString(),
    });
  }

  // 4. Update Agent current task to reflect processing
  await db.agent.update({
    where: { id: agent.id },
    data: { currentTask: `Processing completions for ${stage.name}...` },
  });

  // 5. Gather up-to-date context items for execution
  const currentArtifacts = await db.artifact.findMany({ where: { missionId: mission.id } });
  const currentMessages = await db.agentMessage.findMany({ where: { missionId: mission.id } });

  try {
    const result = await stage.runner({
      mission: { title: mission.title, description: mission.description },
      previousArtifacts: currentArtifacts,
      previousMessages: currentMessages,
      currentTask: { title: task.title, description: task.description },
    });

    // 6. Save completion message
    const compMsg = await db.agentMessage.create({
      data: {
        missionId: mission.id,
        agentId: agent.id,
        role: "ASSISTANT",
        type: "COMPLETION",
        content: result.text,
        metadata: {
          usage: {
            prompt_tokens: result.promptTokens,
            completion_tokens: result.completionTokens,
            total_tokens: result.totalTokens,
          },
          latencyMs: result.latencyMs,
        } as object,
      },
    });
    if (onMessage) {
      onMessage("message", {
        id: compMsg.id,
        agentId: agent.id,
        agentName: agent.name,
        role: "ASSISTANT",
        type: "COMPLETION",
        content: result.text,
        createdAt: compMsg.createdAt.toISOString(),
      });
    }

    // 7. Save Artifact output
    await db.artifact.create({
      data: {
        missionId: mission.id,
        createdByAgent: agent.id,
        title: `${agent.name} — ${stage.artifactTitle}`,
        type: stage.artifactType,
        content: result.text,
        mimeType: "text/markdown",
        sizeBytes: Buffer.byteLength(result.text, "utf8"),
      },
    });

    // 8. Save Metrics
    await db.runtimeMetric.create({
      data: {
        missionId: mission.id,
        agentId: agent.id,
        provider: "btl",
        model: result.model,
        latencyMs: result.latencyMs,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
        estimatedCost: result.estimatedCost,
        estimatedSavings: result.estimatedSavings,
        cacheHit: result.cacheHit,
        semanticCacheHit: result.semanticCacheHit,
      },
    });

    // 9. Mark Agent & Task as completed
    await db.agent.update({
      where: { id: agent.id },
      data: { status: "COMPLETED", currentTask: null, errorMessage: null },
    });

    await db.missionTask.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        output: `Artifact created: ${stage.artifactTitle}`,
        completedAt: new Date(),
      },
    });

    // 10. Increment Mission Progress
    await db.mission.update({
      where: { id: mission.id },
      data: { progress: stage.progressAfter },
    });

    return result.text;
  } catch (error) {
    const errorMsg = (error as Error).message || "Execution failed";

    // Mark failed
    await db.agent.update({
      where: { id: agent.id },
      data: { status: "FAILED", errorMessage: errorMsg, currentTask: null },
    });

    await db.missionTask.update({
      where: { id: task.id },
      data: { status: "FAILED", output: errorMsg, completedAt: new Date() },
    });

    const errMessage = await db.agentMessage.create({
      data: {
        missionId: mission.id,
        agentId: agent.id,
        role: "ASSISTANT",
        type: "ERROR",
        content: errorMsg,
      },
    });
    if (onMessage) {
      onMessage("message", {
        id: errMessage.id,
        agentId: agent.id,
        agentName: agent.name,
        role: "ASSISTANT",
        type: "ERROR",
        content: errorMsg,
        createdAt: errMessage.createdAt.toISOString(),
      });
    }

    throw error;
  }
}

/**
 * Core Orchestrator execution loop.
 */
export async function executeMissionPipeline(
  missionId: string,
  onMessage?: (event: string, data: any) => void
): Promise<void> {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    include: {
      agents: true,
      tasks: true,
      artifacts: true,
      messages: true,
    },
  });

  if (!mission) {
    throw new Error(`Mission ${missionId} not found`);
  }

  // Define each stage mapper
  const plannerDef = STAGES[0];
  const researchDef = STAGES[1];
  const productDef = STAGES[2];
  const architectDef = STAGES[3];
  const engineerDef = STAGES[4];
  const qaDef = STAGES[5];
  const reviewerDef = STAGES[6];

  // Look up matched agents for each stage
  const plannerAgent = findAgentForStage(mission.agents, plannerDef);
  const researchAgent = findAgentForStage(mission.agents, researchDef);
  const productAgent = findAgentForStage(mission.agents, productDef);
  const architectAgent = findAgentForStage(mission.agents, architectDef);
  const engineerAgent = findAgentForStage(mission.agents, engineerDef);
  const qaAgent = findAgentForStage(mission.agents, qaDef);
  const reviewerAgent = findAgentForStage(mission.agents, reviewerDef);

  // Mark mission as running and initialize all agents to WAITING
  await db.mission.update({
    where: { id: missionId },
    data: { status: "RUNNING", progress: 0 },
  });
  await db.agent.updateMany({
    where: { missionId },
    data: { status: "WAITING", currentTask: "Waiting for preceding pipeline stages..." },
  });

  // Stage 1: Planner runs first
  if (plannerAgent) {
    await runStage({ mission, agent: plannerAgent, stage: plannerDef, onMessage });
  }

  // Stage 2 & 3: Research and Product run in parallel
  if (researchAgent || productAgent) {
    const promises: Promise<any>[] = [];
    if (researchAgent) {
      promises.push(runStage({ mission, agent: researchAgent, stage: researchDef, onMessage }));
    }
    if (productAgent) {
      promises.push(runStage({ mission, agent: productAgent, stage: productDef, onMessage }));
    }
    await Promise.all(promises);
  }

  // Stage 4: Architect runs after Research & Product
  if (architectAgent) {
    await runStage({ mission, agent: architectAgent, stage: architectDef, onMessage });
  }

  // Stage 5: Engineer runs after Architect
  if (engineerAgent) {
    await runStage({ mission, agent: engineerAgent, stage: engineerDef, onMessage });
  }

  // Stage 6: QA runs after Engineer
  if (qaAgent) {
    await runStage({ mission, agent: qaAgent, stage: qaDef, onMessage });
  }

  // Stage 7: Reviewer runs last
  if (reviewerAgent) {
    await runStage({ mission, agent: reviewerAgent, stage: reviewerDef, onMessage });
  }

  // Complete mission
  await db.mission.update({
    where: { id: missionId },
    data: { status: "COMPLETED", progress: 100 },
  });

  if (onMessage) {
    onMessage("done", { missionId, status: "COMPLETED" });
  }
}

/**
 * Retries a single agent's execution stage
 */
export async function retryAgent(agentId: string): Promise<void> {
  const agent = await db.agent.findUnique({
    where: { id: agentId },
  });
  if (!agent) {
    throw new Error("Agent not found");
  }

  const mission = await db.mission.findUnique({
    where: { id: agent.missionId },
    include: {
      agents: true,
      tasks: true,
      artifacts: true,
      messages: true,
    },
  });
  if (!mission) {
    throw new Error("Mission not found");
  }

  // Find stage definition matching this agent
  const stage = STAGES.find((s) => {
    const roleLower = agent.role.toLowerCase();
    const nameLower = agent.name.toLowerCase();
    return s.roleKeywords.some((kw) => roleLower.includes(kw) || nameLower.includes(kw));
  });
  if (!stage) {
    throw new Error("No stage matches this agent's configuration");
  }

  // Set mission and agent status to indicate running / retrying
  await db.mission.update({
    where: { id: mission.id },
    data: { status: "RUNNING" },
  });

  await db.agent.update({
    where: { id: agent.id },
    data: {
      status: "RETRYING",
      currentTask: `Manual execution retry initiating for ${stage.name}...`,
      errorMessage: null,
    },
  });

  await db.agentMessage.create({
    data: {
      missionId: mission.id,
      agentId: agent.id,
      role: "ASSISTANT",
      type: "STATUS",
      content: `[Retry] User triggered manual execution retry for agent: ${agent.name} (${agent.role})`,
    },
  });

  try {
    // Execute stage
    await runStage({ mission, agent, stage });

    // Set mission status back to COMPLETED
    await db.mission.update({
      where: { id: mission.id },
      data: { status: "COMPLETED" },
    });
  } catch (error) {
    // Set mission status to FAILED
    await db.mission.update({
      where: { id: mission.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

/**
 * Triggers revision for a single agent's execution stage
 */
export async function reviseAgent(agentId: string, revisionPrompt: string): Promise<void> {
  const agent = await db.agent.findUnique({
    where: { id: agentId },
  });
  if (!agent) {
    throw new Error("Agent not found");
  }

  const mission = await db.mission.findUnique({
    where: { id: agent.missionId },
    include: {
      agents: true,
      tasks: true,
      artifacts: true,
      messages: true,
    },
  });
  if (!mission) {
    throw new Error("Mission not found");
  }

  // Find stage definition matching this agent
  const stage = STAGES.find((s) => {
    const roleLower = agent.role.toLowerCase();
    const nameLower = agent.name.toLowerCase();
    return s.roleKeywords.some((kw) => roleLower.includes(kw) || nameLower.includes(kw));
  });
  if (!stage) {
    throw new Error("No stage matches this agent's configuration");
  }

  // Set mission and agent status to indicate running / retrying
  await db.mission.update({
    where: { id: mission.id },
    data: { status: "RUNNING" },
  });

  await db.agent.update({
    where: { id: agent.id },
    data: {
      status: "RETRYING",
      currentTask: `Executing revisions for ${stage.name}...`,
      errorMessage: null,
    },
  });

  // Log a USER message with the revision request so it gets injected into the LLM prompt context!
  await db.agentMessage.create({
    data: {
      missionId: mission.id,
      agentId: agent.id,
      role: "USER",
      type: "LOG",
      content: `[Revision Request for ${agent.name}]: ${revisionPrompt}`,
    },
  });

  try {
    // Execute stage
    await runStage({ mission, agent, stage });

    // Set mission status back to COMPLETED
    await db.mission.update({
      where: { id: mission.id },
      data: { status: "COMPLETED" },
    });
  } catch (error) {
    // Set mission status to FAILED
    await db.mission.update({
      where: { id: mission.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}


