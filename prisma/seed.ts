import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

// Self-contained environment variables parser for CLI execution
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  }
}


async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/foundry",
  });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  console.log("Seeding database...");

  // 1. Ensure User exists
  const user = await db.user.upsert({
    where: { email: "demo@badtheorylabs.com" },
    update: {},
    create: {
      email: "demo@badtheorylabs.com",
      name: "Demo Account",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
    },
  });

  // 2. Clear out existing demo mission with same title to prevent duplication
  const title = "Build an inventory management system for pharmacies.";
  const existingMissions = await db.mission.findMany({ where: { title } });
  for (const m of existingMissions) {
    await db.mission.delete({ where: { id: m.id } });
  }

  // 3. Create demo completed mission
  const mission = await db.mission.create({
    data: {
      title,
      description:
        "An end-to-end cloud-native inventory system targeting independent pharmacies. Must integrate with prescription dispensers, maintain drug tracking, support low-stock alerts, and conform to HIPAA compliance regulations.",
      type: "Software Product",
      constraints:
        "Must be HIPAA compliant. Maximum request latency under 200ms. Database should run on PostgreSQL with SSL.",
      expectedDeliverables:
        "Product requirements document, competitive analysis report, system architectural blueprint, prisma database schema suggestions, edge-case test plan, and final reviewer consolidation.",
      status: "COMPLETED",
      progress: 100,
      userId: user.id,
    },
  });

  // 4. Create agents for this mission
  const planner = await db.agent.create({
    data: {
      missionId: mission.id,
      name: "Planner Agent",
      role: "Planner",
      model: "gpt-4o",
      status: "DONE",
    },
  });

  const researcher = await db.agent.create({
    data: {
      missionId: mission.id,
      name: "Research Agent",
      role: "Researcher",
      model: "gpt-4o",
      status: "DONE",
    },
  });

  const product = await db.agent.create({
    data: {
      missionId: mission.id,
      name: "Product Agent",
      role: "Product Manager",
      model: "gpt-4o",
      status: "DONE",
    },
  });

  const architect = await db.agent.create({
    data: {
      missionId: mission.id,
      name: "Architect Agent",
      role: "Architect",
      model: "gpt-4o",
      status: "DONE",
    },
  });

  const engineer = await db.agent.create({
    data: {
      missionId: mission.id,
      name: "Engineer Agent",
      role: "Engineer",
      model: "gpt-4o",
      status: "DONE",
    },
  });

  const qa = await db.agent.create({
    data: {
      missionId: mission.id,
      name: "QA Agent",
      role: "QA Specialist",
      model: "gpt-4o",
      status: "DONE",
    },
  });

  const reviewer = await db.agent.create({
    data: {
      missionId: mission.id,
      name: "Reviewer Agent",
      role: "Lead Reviewer",
      model: "gpt-4o",
      status: "DONE",
    },
  });

  // 5. Create completed tasks
  const taskNames = [
    "Planning Stage",
    "Research Stage",
    "Product Design Stage",
    "System Architecture Stage",
    "Engineering Stage",
    "Quality Assurance Stage",
    "Final Review Stage",
  ];

  const agentMapping = [planner, researcher, product, architect, engineer, qa, reviewer];

  for (let i = 0; i < taskNames.length; i++) {
    await db.missionTask.create({
      data: {
        missionId: mission.id,
        agentId: agentMapping[i].id,
        title: taskNames[i],
        description: `Execute specialized agent pipeline logic for ${taskNames[i]}`,
        status: "COMPLETED",
        output: `Artifact successfully generated for ${taskNames[i]}`,
        startedAt: new Date(Date.now() - 3600000 * (7 - i)),
        completedAt: new Date(Date.now() - 3600000 * (7 - i) + 120000),
      },
    });
  }

  // 6. Create AgentMessages (Chat history logs)
  const logs = [
    {
      agent: planner,
      role: "ASSISTANT" as const,
      type: "COMPLETION" as const,
      content:
        "Initiated planning stage. Decomposed mission objective into 3 critical path milestones: (1) PRD & Domain validation, (2) DB Schema & Architecture drafting, and (3) Code Boilerplate compilation.",
    },
    {
      agent: researcher,
      role: "ASSISTANT" as const,
      type: "COMPLETION" as const,
      content:
        "Competitive analysis complete. Key compliance risks identified around HIPAA security rules (Access control, Audit logs, Data encryption-at-rest). Suggested reference templates and integration paths.",
    },
    {
      agent: product,
      role: "ASSISTANT" as const,
      type: "COMPLETION" as const,
      content:
        "Drafted PRD specification. Set up 8 core user stories covering real-time inventory adjustments, medication expiration trackers, low-stock warnings, and dispenser interfaces.",
    },
    {
      agent: architect,
      role: "ASSISTANT" as const,
      type: "COMPLETION" as const,
      content:
        "System architecture defined. Proposed a robust Next.js application shell backed by PostgreSQL. Implemented Mermaid schemas showing inventory transitions and log tracking tables.",
    },
    {
      agent: engineer,
      role: "ASSISTANT" as const,
      type: "COMPLETION" as const,
      content:
        "Wrote Prisma schema definition suggestions including Medication, InventoryRecord, AuditLog, and low-stock alert models. Provided base database transaction logic.",
    },
    {
      agent: qa,
      role: "ASSISTANT" as const,
      type: "COMPLETION" as const,
      content:
        "QA test suite generated. Defined 12 edge cases including race conditions during stock decrements, expired drug warnings, and HIPAA compliance verification protocols.",
    },
    {
      agent: reviewer,
      role: "ASSISTANT" as const,
      type: "COMPLETION" as const,
      content:
        "Consolidated all agent outputs into a unified package. Polished specifications, verified database schemas, and structured the final verification checks. Ready for download.",
    },
  ];

  for (const log of logs) {
    await db.agentMessage.create({
      data: {
        missionId: mission.id,
        agentId: log.agent.id,
        role: log.role,
        type: log.type,
        content: log.content,
      },
    });
  }

  // 7. Create Artifact Deliverables
  const deliverables = [
    {
      agent: planner,
      title: "Planner — Milestones & Task Roadmap",
      type: "DOCUMENT" as const,
      content: `# Roadmaps & Execution Tasks
## Milestones
- **M1: Foundation**: PRD, domain specifications, and risk mitigation models.
- **M2: Blueprint**: Complete database schema and API contracts.
- **M3: Validation**: Edge case audits and testing suites.

## Timeline Task Breakdown
- Task 1: Research competitor pricing (assigned to Researcher).
- Task 2: Outline HIPAA safeguards (assigned to PM).
- Task 3: Database design & migrations (assigned to Architect).`,
    },
    {
      agent: researcher,
      title: "Research Agent — Domain & Competitive Intelligence Report",
      type: "ANALYSIS" as const,
      content: `# Market & Risk Analysis
## Competitor Reference Points
- *PillPack*: Direct home delivery models, prescription synchronization.
- *Enterprise Rx*: Legacy pharmacy management system, complex UI.

## Compliance Constraints
- **HIPAA Safeguards**: All database records must be encrypted. Write access requires multi-factor authentication.
- **Audit Trails**: Every inventory modification must log user ID, timestamp, and previous values.`,
    },
    {
      agent: product,
      title: "Product Agent — Product Requirements Document (PRD)",
      type: "DOCUMENT" as const,
      content: `# Product Specification (PRD)
## Scope
Provide a web dashboard for pharmacists and a localized tablet client for dispensers.

## Core User Stories
1. **As a pharmacist**, I want to receive low-stock alerts automatically, so that I can reorder medicines before they run out.
2. **As an auditor**, I want to view a tamper-proof log of stock adjustments, so that we comply with state regulations.`,
    },
    {
      agent: architect,
      title: "Architect Agent — System & API Blueprint",
      type: "DIAGRAM" as const,
      content: `# Technical Architecture & API Design
## High Level Architecture
\`\`\`
[Tablet Client] --> [REST API / Next.js Gateway] --> [PostgreSQL DB]
                                                --> [Prescription Dispenser API]
\`\`\`

## Endpoint contracts
- \`GET /api/inventory\`: Fetch current list of medications with quantities.
- \`POST /api/inventory/transaction\`: Adjust stock (increments/decrements).`,
    },
    {
      agent: engineer,
      title: "Engineer Agent — Technical Implementation Mocks",
      type: "CODE" as const,
      content: `\`\`\`prisma
// Suggested database model structure for the core pharmacy application
model Medication {
  id          String   @id @default(cuid())
  ndcCode     String   @unique // National Drug Code
  name        String
  quantity    Int      @default(0)
  expiration  DateTime
  transactions Transaction[]
}

model Transaction {
  id           String   @id @default(cuid())
  medicationId String
  medication   Medication @relation(fields: [medicationId], references: [id])
  type         String   // DISPENSE | REFILL
  amount       Int
  createdAt    DateTime @default(now())
}
\`\`\``,
    },
    {
      agent: qa,
      title: "QA Agent — Validation Checklist & QA Scenarios",
      type: "REPORT" as const,
      content: `# Quality Assurance Test Cases
## Edge Cases
- **Scenario A**: Stock quantity goes to 0 during active transaction. Expected: Block transaction and trigger low-stock hook.
- **Scenario B**: Expired medication scan. Expected: Prompt alert overlay and block dispensing.

## Verification Checklist
- [x] Verify SSL connection to database.
- [x] Test concurrent transaction decrements under load (100 req/sec).`,
    },
    {
      agent: reviewer,
      title: "Reviewer Agent — Unified Deliverables Package",
      type: "REPORT" as const,
      content: `# Consolidated Pharmacy MVP Specifications
This package integrates all agent deliverables:
1. **PRD & Roadmap**: Outlines MVP features and timelines.
2. **Database & API Blueprint**: Technical guidelines for backend engineering.
3. **QA Scenarios**: Guidelines for validating compliance and performance metrics.`,
    },
  ];

  for (const d of deliverables) {
    await db.artifact.create({
      data: {
        missionId: mission.id,
        createdByAgent: d.agent.id,
        title: d.title,
        type: d.type,
        content: d.content,
        mimeType: "text/markdown",
        sizeBytes: Buffer.byteLength(d.content, "utf8"),
      },
    });
  }

  // 8. Create RuntimeMetrics
  const metricsData = [
    {
      agent: planner,
      latency: 1200,
      prompt: 850,
      completion: 950,
      cost: 0.012,
      savings: 0.0,
      hit: false,
      semHit: false,
    },
    {
      agent: researcher,
      latency: 350,
      prompt: 920,
      completion: 1100,
      cost: 0.0,
      savings: 0.015,
      hit: true,
      semHit: false,
    },
    {
      agent: product,
      latency: 280,
      prompt: 1200,
      completion: 1400,
      cost: 0.0,
      savings: 0.022,
      hit: false,
      semHit: true,
    },
    {
      agent: architect,
      latency: 1800,
      prompt: 1500,
      completion: 1600,
      cost: 0.025,
      savings: 0.0,
      hit: false,
      semHit: false,
    },
    {
      agent: engineer,
      latency: 2200,
      prompt: 1800,
      completion: 1900,
      cost: 0.032,
      savings: 0.0,
      hit: false,
      semHit: false,
    },
    {
      agent: qa,
      latency: 1500,
      prompt: 1100,
      completion: 1250,
      cost: 0.018,
      savings: 0.0,
      hit: false,
      semHit: false,
    },
    {
      agent: reviewer,
      latency: 2800,
      prompt: 3200,
      completion: 2400,
      cost: 0.045,
      savings: 0.0,
      hit: false,
      semHit: false,
    },
  ];

  for (const m of metricsData) {
    await db.runtimeMetric.create({
      data: {
        missionId: mission.id,
        agentId: m.agent.id,
        provider: "btl",
        model: "gpt-4o",
        latencyMs: m.latency,
        promptTokens: m.prompt,
        completionTokens: m.completion,
        totalTokens: m.prompt + m.completion,
        estimatedCost: m.cost,
        estimatedSavings: m.savings,
        cacheHit: m.hit,
        semanticCacheHit: m.semHit,
      },
    });
  }

  console.log("Seeding complete! Seeded Mission ID:", mission.id);
  await db.$disconnect();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
