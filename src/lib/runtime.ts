import OpenAI from "openai";

// Initialize OpenAI client pointed at BTL Runtime
const baseURL = process.env.BTL_RUNTIME_BASE_URL || "https://api.badtheorylabs.com/v1";
const apiKey = process.env.BTL_RUNTIME_API_KEY || process.env.BTL_API_KEY || "placeholder";

export const btlClient = new OpenAI({
  apiKey,
  baseURL,
});

export interface GenerateAgentResponseOptions {
  agentName: string;
  agentRole: string;
  missionContext: string;
  task: string;
  systemPrompt?: string;
  userPrompt?: string;
  model?: string;
}

export interface AgentResponse {
  text: string;
  model: string;
  latencyMs: number;
  cacheHit: boolean;
  semanticCacheHit: boolean;
  estimatedCost: number;
  estimatedSavings: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Utility to parse boolean values from HTTP headers
 */
function parseBoolHeader(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

/**
 * Utility to parse numeric values from HTTP headers
 */
function parseNumHeader(value: string | null | undefined): number {
  if (!value) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Calls BTL Runtime (/v1/chat/completions) using the OpenAI SDK,
 * measures latency, and extracts cache telemetry and cost information from response headers.
 */
export async function generateAgentResponse({
  agentName,
  agentRole,
  missionContext,
  task,
  systemPrompt,
  userPrompt,
  model = process.env.BTL_STRONG_MODEL || "gpt-4o",
}: GenerateAgentResponseOptions): Promise<AgentResponse> {
  const finalSystemPrompt =
    systemPrompt ||
    `You are ${agentName}, a specialist AI agent with the role of ${agentRole}. 
You are part of a collaborative multi-agent team working on a mission.
Be concise, specific, and produce high-quality output in your area of expertise.
Mission Context: ${missionContext}`;

  const finalUserPrompt = userPrompt || `Task: ${task}`;

  const startTime = Date.now();

  // Request completions using OpenAI SDK, retrieving raw response for headers access
  const apiPromise = btlClient.chat.completions.create({
    model,
    messages: [
      { role: "system", content: finalSystemPrompt },
      { role: "user", content: finalUserPrompt },
    ],
  });

  const response = await apiPromise.asResponse();
  const latencyMs = Date.now() - startTime;

  // Extract custom BTL telemetry headers
  const cacheHit =
    parseBoolHeader(response.headers.get("x-cache-hit")) ||
    parseBoolHeader(response.headers.get("x-btl-cache-hit")) ||
    parseBoolHeader(response.headers.get("x-cache"));

  const semanticCacheHit =
    parseBoolHeader(response.headers.get("x-semantic-cache-hit")) ||
    parseBoolHeader(response.headers.get("x-btl-semantic-cache-hit"));

  const estimatedCost =
    parseNumHeader(response.headers.get("x-estimated-cost")) ||
    parseNumHeader(response.headers.get("x-btl-estimated-cost")) ||
    parseNumHeader(response.headers.get("x-cost"));

  const estimatedSavings =
    parseNumHeader(response.headers.get("x-estimated-savings")) ||
    parseNumHeader(response.headers.get("x-btl-estimated-savings")) ||
    parseNumHeader(response.headers.get("x-savings"));

  // Parse actual JSON payload
  const body = (await response.json()) as OpenAI.ChatCompletion;
  const text = body.choices[0]?.message?.content || "";
  const returnedModel = body.model || model;

  const promptTokens = body.usage?.prompt_tokens ?? 0;
  const completionTokens = body.usage?.completion_tokens ?? 0;
  const totalTokens = body.usage?.total_tokens ?? 0;

  return {
    text,
    model: returnedModel,
    latencyMs,
    cacheHit,
    semanticCacheHit,
    estimatedCost,
    estimatedSavings,
    promptTokens,
    completionTokens,
    totalTokens,
  };
}
