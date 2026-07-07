import OpenAI from "openai";

if (!process.env.BTL_RUNTIME_BASE_URL) {
  throw new Error("BTL_RUNTIME_BASE_URL is not set in environment variables");
}

export const ai = new OpenAI({
  apiKey: process.env.BTL_RUNTIME_API_KEY ?? "placeholder",
  baseURL: process.env.BTL_RUNTIME_BASE_URL,
});

export type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
