"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AgentNode } from "./AgentNode";
import { MissionNode } from "./MissionNode";

const nodeTypes = {
  mission: MissionNode,
  agent: AgentNode,
};

interface ExecutionGraphProps {
  mission: {
    id: string;
    title: string;
    status: string;
  };
  agents: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
    currentTask?: string;
  }>;
}

function buildGraph(
  mission: ExecutionGraphProps["mission"],
  agents: ExecutionGraphProps["agents"]
) {
  const nodes: Node[] = [
    {
      id: "mission",
      type: "mission",
      position: { x: 0, y: 0 },
      data: { label: mission.title, status: mission.status },
    },
  ];

  const edges: Edge[] = [];
  const perRow = Math.min(agents.length, 4);
  const spacing = 210;
  const startX = -((perRow - 1) * spacing) / 2;

  agents.forEach((agent, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x   = startX + col * spacing;
    const y   = 170 + row * 150;

    nodes.push({
      id:   agent.id,
      type: "agent",
      position: { x, y },
      data: {
        name:        agent.name,
        role:        agent.role,
        status:      agent.status,
        currentTask: agent.currentTask,
      },
    });

    edges.push({
      id:       `mission-${agent.id}`,
      source:   "mission",
      target:   agent.id,
      animated: agent.status === "WORKING" || agent.status === "THINKING",
      style: {
        stroke:
          agent.status === "DONE"    ? "var(--color-success)" :
          agent.status === "ERROR"   ? "var(--color-error)"   :
          agent.status === "WORKING" ? "var(--color-primary)" :
          "var(--color-border-default)",
        strokeWidth: 1.5,
      },
    });
  });

  return { nodes, edges };
}

export function ExecutionGraph({ mission, agents }: ExecutionGraphProps) {
  const { nodes: initialNodes, edges: initialEdges } = buildGraph(mission, agents);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        className="bg-(--color-bg-base)"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const s = (node.data as { status?: string }).status;
            if (s === "DONE")              return "var(--color-success)";
            if (s === "ERROR")             return "var(--color-error)";
            if (s === "WORKING")           return "var(--color-primary)";
            if (s === "THINKING")          return "var(--color-agent-thinking)";
            if (s === "WAITING")           return "var(--color-warning)";
            return "var(--color-bg-overlay)";
          }}
        />
      </ReactFlow>
    </div>
  );
}
