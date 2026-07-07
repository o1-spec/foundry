import { generateAgentResponse, type AgentResponse } from "./runtime";
import type { Mission, Artifact, AgentMessage, MissionTask } from "@prisma/client";

export interface AgentExecutionOptions {
  mission: Pick<Mission, "title" | "description">;
  previousArtifacts: Array<Pick<Artifact, "title" | "type" | "content">>;
  previousMessages: Array<Pick<AgentMessage, "role" | "type" | "content">>;
  currentTask: Pick<MissionTask, "title" | "description">;
}

/**
 * Formats previous artifacts and messages into a clean markdown structure for context injector
 */
function formatContext(
  previousArtifacts: AgentExecutionOptions["previousArtifacts"],
  previousMessages: AgentExecutionOptions["previousMessages"]
): string {
  let context = "";

  if (previousArtifacts.length > 0) {
    context += "\n--- START PREVIOUS DELIVERABLES/ARTIFACTS ---\n";
    previousArtifacts.forEach((art, idx) => {
      context += `\nArtifact #${idx + 1}: "${art.title}" (Type: ${art.type})\n`;
      context += `\`\`\`markdown\n${art.content}\n\`\`\`\n`;
    });
    context += "--- END PREVIOUS DELIVERABLES/ARTIFACTS ---\n";
  }

  if (previousMessages.length > 0) {
    context += "\n--- START PREVIOUS MISSION AND AGENT LOGS ---\n";
    previousMessages
      .filter((m) => m.type === "COMPLETION" || m.type === "LOG" || m.role === "USER")
      .slice(-15) // Include up to last 15 relevant logs/completions/USER directives
      .forEach((msg) => {
        context += `[${msg.role}]: ${msg.content}\n`;
      });
    context += "--- END PREVIOUS MISSION AND AGENT LOGS ---\n";
  }

  return context;
}

// ─── 1. Planner Agent ───────────────────────────────────────────────
export async function runPlannerAgent(options: AgentExecutionOptions): Promise<AgentResponse> {
  const context = formatContext(options.previousArtifacts, options.previousMessages);
  const systemPrompt = `You are the Foundry Planner Agent, a specialist AI agent responsible for mission breakdown and roadmap sequencing.
Your goal is to take a high-level mission objective and break it down into structured milestones and clear, actionable execution tasks.

Provide your plan in structured markdown with the following format:
# Execution Plan & Roadmap
## 1. Milestones
- List key milestones with criteria.
## 2. Detailed Task Breakdown
- Task name, assignee role recommendation, priority, and dependency list.
## 3. Critical Path
- Sequence of dependencies that determines the minimum execution timeline.`;

  const userPrompt = `Mission: ${options.mission.title}
Objective: ${options.mission.description}

Current Task to Execute: ${options.currentTask.title}
Task Description: ${options.currentTask.description ?? "N/A"}
${context ? `\nExisting Context:\n${context}` : ""}`;

  return generateAgentResponse({
    agentName: "Planner Agent",
    agentRole: "Planner",
    missionContext: options.mission.description,
    task: options.currentTask.title,
    systemPrompt,
    userPrompt,
  });
}

// ─── 2. Research Agent ──────────────────────────────────────────────
export async function runResearchAgent(options: AgentExecutionOptions): Promise<AgentResponse> {
  const context = formatContext(options.previousArtifacts, options.previousMessages);
  const systemPrompt = `You are the Foundry Research Agent, a specialist AI agent responsible for gathering domain intelligence, competitor context, and assumptions.
Your objective is to provide high-quality reference data, identify major risks, and outline key competitor patterns.

Provide your research in structured markdown with the following format:
# Domain & Competitor Research
## 1. Domain Background & Key Context
- Detailed industry/domain information.
## 2. Competitor Landscape
- Identified competitors and pricing/positioning strategies.
## 3. Assumptions & Hypotheses
- List of core assumptions for this mission.
## 4. Key Risks & Mitigation Options
- Potential execution failure points and how to bypass them.`;

  const userPrompt = `Mission: ${options.mission.title}
Objective: ${options.mission.description}

Current Task to Execute: ${options.currentTask.title}
Task Description: ${options.currentTask.description ?? "N/A"}
${context ? `\nExisting Context:\n${context}` : ""}`;

  return generateAgentResponse({
    agentName: "Research Agent",
    agentRole: "Researcher",
    missionContext: options.mission.description,
    task: options.currentTask.title,
    systemPrompt,
    userPrompt,
  });
}

// ─── 3. Product Agent ───────────────────────────────────────────────
export async function runProductAgent(options: AgentExecutionOptions): Promise<AgentResponse> {
  const context = formatContext(options.previousArtifacts, options.previousMessages);
  const systemPrompt = `You are the Foundry Product Agent, a specialist AI agent responsible for defining product specifications, scope, and user scenarios.
Your objective is to translate objectives and research into solid product requirement documents (PRD) with user stories.

Provide your PRD in structured markdown with the following format:
# Product Requirements Document (PRD)
## 1. Product Scope & Vision
- Key features in scope vs out of scope.
## 2. User Personas & Detailed User Stories
- Format: As a [user], I want to [action], so that [benefit].
## 3. Success Metrics & KPIs
- Quantitative goals for verification.
## 4. Feature Roadmap
- Feature phasing breakdown.`;

  const userPrompt = `Mission: ${options.mission.title}
Objective: ${options.mission.description}

Current Task to Execute: ${options.currentTask.title}
Task Description: ${options.currentTask.description ?? "N/A"}
${context ? `\nExisting Context:\n${context}` : ""}`;

  return generateAgentResponse({
    agentName: "Product Agent",
    agentRole: "Product Manager",
    missionContext: options.mission.description,
    task: options.currentTask.title,
    systemPrompt,
    userPrompt,
  });
}

// ─── 4. Architect Agent ─────────────────────────────────────────────
export async function runArchitectAgent(options: AgentExecutionOptions): Promise<AgentResponse> {
  const context = formatContext(options.previousArtifacts, options.previousMessages);
  const systemPrompt = `You are the Foundry Architect Agent, a specialist AI agent responsible for system architecture, database modeling, and technical design.
Your objective is to design resilient, scalable software structures, select the library stacks, and map API schemas.

Provide your architecture design in structured markdown with the following format:
# System Architecture Design
## 1. High-Level Architecture Overview
- Layout of systems, frontend/backend separation, microservices, and databases.
## 2. Database Schema Design
- Entity Relationship diagrams (using Mermaid) or database table layouts.
## 3. API Contract & Schema Definition
- Key endpoints, request/response formats.
## 4. Key Technical Decisions
- Libraries, cloud providers, caching layer choices, and performance/security safeguards.`;

  const userPrompt = `Mission: ${options.mission.title}
Objective: ${options.mission.description}

Current Task to Execute: ${options.currentTask.title}
Task Description: ${options.currentTask.description ?? "N/A"}
${context ? `\nExisting Context:\n${context}` : ""}`;

  return generateAgentResponse({
    agentName: "Architect Agent",
    agentRole: "Architect",
    missionContext: options.mission.description,
    task: options.currentTask.title,
    systemPrompt,
    userPrompt,
  });
}

// ─── 5. Engineer Agent ──────────────────────────────────────────────
export async function runEngineerAgent(options: AgentExecutionOptions): Promise<AgentResponse> {
  const context = formatContext(options.previousArtifacts, options.previousMessages);
  const systemPrompt = `You are the Foundry Engineer Agent, a specialist AI agent responsible for writing sample code, schema implementations, and components.
Your goal is to build actual mock structures, Prisma schemas, or React boilerplate. Always output clean, complete code snippets.

Provide your technical artifacts in structured markdown with the following format:
# Technical Implementation Guide
## 1. Directory Structure Mappings
- Layout of project folders.
## 2. Prisma Database Schema
- Complete or partial schema definition blocks.
## 3. Code Boilerplate & API Handlers
- Fenced code blocks with typescript/javascript code.
## 4. UI Component Layouts
- React code or styling wrappers.`;

  const userPrompt = `Mission: ${options.mission.title}
Objective: ${options.mission.description}

Current Task to Execute: ${options.currentTask.title}
Task Description: ${options.currentTask.description ?? "N/A"}
${context ? `\nExisting Context:\n${context}` : ""}`;

  return generateAgentResponse({
    agentName: "Engineer Agent",
    agentRole: "Engineer",
    missionContext: options.mission.description,
    task: options.currentTask.title,
    systemPrompt,
    userPrompt,
  });
}

// ─── 6. QA Agent ────────────────────────────────────────────────────
export async function runQAAgent(options: AgentExecutionOptions): Promise<AgentResponse> {
  const context = formatContext(options.previousArtifacts, options.previousMessages);
  const systemPrompt = `You are the Foundry QA Agent, a specialist AI agent responsible for testing plans, validation suites, and edge cases.
Your goal is to design exhaustive test matrices, audit security concerns, and create validation scripts.

Provide your validation report in structured markdown with the following format:
# Quality Assurance & Testing Plan
## 1. High-Level Test Matrix
- Unit, Integration, and End-to-End coverage targets.
## 2. Critical Edge Cases & Failure Scenarios
- Unhappy paths, network errors, validation failures.
## 3. Security Audit & Common Vulnerabilities
- Safeguards against injection, unauthorized data access, rate limits.
## 4. Mock Verification Scripts
- Assertions or sample testing commands (Jest, Cypress, Playwright).`;

  const userPrompt = `Mission: ${options.mission.title}
Objective: ${options.mission.description}

Current Task to Execute: ${options.currentTask.title}
Task Description: ${options.currentTask.description ?? "N/A"}
${context ? `\nExisting Context:\n${context}` : ""}`;

  return generateAgentResponse({
    agentName: "QA Agent",
    agentRole: "QA Specialist",
    missionContext: options.mission.description,
    task: options.currentTask.title,
    systemPrompt,
    userPrompt,
  });
}

// ─── 7. Reviewer Agent ──────────────────────────────────────────────
export async function runReviewerAgent(options: AgentExecutionOptions): Promise<AgentResponse> {
  const context = formatContext(options.previousArtifacts, options.previousMessages);
  const systemPrompt = `You are the Foundry Reviewer Agent, the lead consolidation AI agent responsible for validating and packaging all other outputs.
Your task is to merge, polish, and synthesize all previous agent deliverables into a unified, high-quality, product-ready package.

Provide the final delivery package in structured markdown with the following format:
# Final Delivery Package
## 1. Executive Summary
- Consolidated vision of the entire mission output.
## 2. Integrated Roadmaps & Specifications
- Harmonized specs from Planner and Product agents.
## 3. Technical Blueprint & Code Architecture
- Synthesized system design and mock code directories.
## 4. Risk Mitigation & Verification Checklists
- Combined check parameters from QA and Research.`;

  const userPrompt = `Mission: ${options.mission.title}
Objective: ${options.mission.description}

Current Task to Execute: ${options.currentTask.title}
Task Description: ${options.currentTask.description ?? "N/A"}
${context ? `\nExisting Context:\n${context}` : ""}`;

  return generateAgentResponse({
    agentName: "Reviewer Agent",
    agentRole: "Lead Reviewer",
    missionContext: options.mission.description,
    task: options.currentTask.title,
    systemPrompt,
    userPrompt,
  });
}
