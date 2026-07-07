import { z } from "zod";

// ─── Agent roles ────────────────────────────────────────────────────
export const AgentRoleSchema = z.object({
  name:  z.string().min(1, "Agent name is required"),
  role:  z.string().min(1, "Role is required"),
  model: z.string().default(process.env.BTL_STRONG_MODEL || "gpt-4o"),
});

// ─── Mission ────────────────────────────────────────────────────────
export const CreateMissionSchema = z.object({
  title:                z.string().min(3, "Title must be at least 3 characters").max(100),
  description:          z.string().min(10, "Description must be at least 10 characters").max(2000),
  type:                 z.string().min(1, "Mission type is required"),
  constraints:          z.string().optional().nullable(),
  expectedDeliverables: z.string().optional().nullable(),
  agents:               z.array(AgentRoleSchema).optional(),
});

export const UpdateMissionSchema = z.object({
  title:       z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  status:      z.enum(["PENDING", "RUNNING", "PAUSED", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
  progress:    z.number().int().min(0).max(100).optional(),
});

// ─── Task ───────────────────────────────────────────────────────────
export const CreateTaskSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().optional(),
  agentId:     z.string().optional(),
  priority:    z.number().int().min(0).default(0),
  dependsOn:   z.array(z.string()).default([]),
});

// ─── Inferred types ─────────────────────────────────────────────────
export type CreateMissionInput = z.infer<typeof CreateMissionSchema>;
export type UpdateMissionInput = z.infer<typeof UpdateMissionSchema>;
export type AgentRoleInput     = z.infer<typeof AgentRoleSchema>;
export type CreateTaskInput    = z.infer<typeof CreateTaskSchema>;
