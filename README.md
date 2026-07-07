# 🛠️ Foundry

### Staged Multi-Agent Command Center & Telemetry Studio

> **Hackathon Pitch:** Deploy custom agent teams, orchestrate parallel execution graphs, and trace cost/latency telemetry with sub-second cache hit monitoring and human-in-the-loop controls.

---

## 📌 The Problem
Building multi-agent systems is hard. Managing agent handoffs, preserving context across sequential steps, controlling token costs, debugging latency bottlenecks, and lack of human oversight often result in fragile pipelines, runaway expenses, and unaligned outputs.

## 💡 The Solution
**Foundry** is a premium command center for developer-agent workflows. It provides a visual execution graph, structured pipeline orchestration, granular cost-savings telemetry, and live human intervention control. Users can dynamically inject new instructions mid-run, ask specific agents for revisions, regenerate artifacts in isolation, and approve the final deliverables.

---

## ⚡ How BTL Runtime is Used

Foundry integrates with the OpenAI-compatible **BTL Runtime** endpoint to invoke specialist agents and gather execution telemetry. 

* **Endpoint Used:** `POST /v1/chat/completions`
* **Custom Headers & Telemetry Tracking:** Foundry reads response headers to extract:
  * `x-cache-hit` and `x-semantic-cache-hit` for latency tracking.
  * `x-estimated-cost` and `x-estimated-savings` to measure token efficiency.
* **Context Assembly:** Foundry packages previous deliverables (artifacts) and logs into the chat context, ensuring each specialist builds on preceding domain context.

---

## ✨ Features

* **Staged Pipelines:** Deploys a team of 7 specialist agents in sequential and parallel stages:
  1. **Planner**: Creates execution tasks and roadmaps.
  2. **Researcher** & **Product Manager**: Gather domain intelligence and write PRDs in parallel.
  3. **Architect**: Designs API endpoints and database schemas.
  4. **Engineer**: Generates mock structures, frontend layouts, and routes.
  5. **QA Engineer**: Drafts test checklists and failure matrices.
  6. **Lead Reviewer**: Consolidates all outputs into a final package.
* **Interactive React Flow Execution Canvas:** Live visual tracking showing which agent is `WAITING`, `RUNNING`, `RETRYING`, `COMPLETED`, or `FAILED`.
* **Split Layout Artifact Viewer:** Clean side-by-side workspace to explore categorized documents (documents, code, diagrams, analyses, reports) with copy and `.md` download capabilities.
* **Live SSE Activity Feed:** Real-time reasoning and completion trace streaming directly from the server.
* **Human-in-the-Loop Controls:**
  * **Instruction Injection**: Prompt mission-wide directives mid-run.
  * **Targeted Agent Revisions**: Click "Revise" on an agent card to prompt adjustments (e.g., "Add security headers").
  * **Isolated Regeneration**: Regenerate specific artifacts without re-running the entire pipeline.
  * **Final Package Approval**: Review and approve the final package.
* **Cost & Cache Hit Telemetry Dashboard**: Detailed metrics summarizing token usage, latency averages, and model distribution.

---

## 🛠️ Tech Stack

* **Frontend & Backend Framework:** Next.js (App Router, Turbopack)
* **Programming Language:** TypeScript
* **Database & ORM:** PostgreSQL & Prisma ORM
* **Graph Visualization:** React Flow (`@xyflow/react`)
* **Styling & UI Components:** Tailwind CSS, Shadcn UI, Lucide Icons, Sonner

---

## 🚀 Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/foundry.git
cd foundry
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Database Connection (Points to PostgreSQL)
DATABASE_URL="postgresql://postgres@localhost:5439/foundry"

# BTL Runtime Configuration
BTL_RUNTIME_BASE_URL="https://api.badtheorylabs.com/v1"
BTL_RUNTIME_API_KEY="your_btl_api_key_here"
```

### 3. Initialize & Seed Database
Initialize the database cluster, push the schema, and seed the demo data:
```bash
# Initialize and start a local pg cluster in the workspace
/Library/PostgreSQL/18/bin/initdb -D db_data -U postgres -A trust
/Library/PostgreSQL/18/bin/pg_ctl -D db_data -l db_data/logfile -o "-p 5439" start
/Library/PostgreSQL/18/bin/createdb -h localhost -p 5439 -U postgres foundry

# Sync schema and seed
export DATABASE_URL="postgresql://postgres@localhost:5439/foundry"
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📊 Live Demo Mission

Foundry comes pre-seeded with a comprehensive demo mission:
**"Build an inventory management system for pharmacies"**

Explore the seeded execution graph, metrics, activity feeds, and read the generated deliverables (PRD, API Spec, Database Blueprint, and QA matrices) directly from the Artifact console.

---

## 📸 Screenshots

| Dashboard Ledger | Execution Canvas & Live Telemetry |
| :---: | :---: |
| *[Screenshot Placeholder: Operations Command Center]* | *[Screenshot Placeholder: Live Node graph & Metrics]* |

| Category Workspace Viewer | Human Intervention console |
| :---: | :---: |
| *[Screenshot Placeholder: Document Viewer]* | *[Screenshot Placeholder: Revision inputs & Approval controls]* |

---

## 👥 Team Members

* **[Team Member 1]** - Lead Architect & Backend Engineer
* **[Team Member 2]** - Frontend Developer & UI Designer
* **[Team Member 3]** - Product Lead & QA tester
