import type { FastifyRequest, FastifyReply } from "fastify";;

export interface Provider {
  name: string;
  proxyRequest(req: FastifyRequest, reply: FastifyReply): Promise<void>;
  calculateCost(usage: { prompt_tokens: number; completion_tokens: number }, model: string): number;
}