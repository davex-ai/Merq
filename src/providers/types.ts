import type { FastifyRequest, FastifyReply } from "fastify";
import type { UsageRecord } from "../types/openai.js";

export interface Provider {
  name: string;
  proxyRequest(req: FastifyRequest, reply: FastifyReply): Promise<void>;
  calculateCost(usage: { prompt_tokens: number; completion_tokens: number }, model: string): number;
}