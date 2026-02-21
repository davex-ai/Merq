import type { FastifyRequest, FastifyReply } from "fastify";
import type { Provider } from "./types.js";
import { OpenAIProvider } from "../openai/provider.js";
import { AnthropicProvider } from "../anthropic/provider.js"; 

export const providers: Record<string, Provider> = {
  openai: OpenAIProvider,
  anthropic: AnthropicProvider,
};

export async function handleProviderRequest(
  providerName: string,
  req: FastifyRequest,
  reply: FastifyReply
) {
  const provider = providers[providerName];
  if (!provider) {
    return reply.status(404).send({ error: "Provider not found" });
  }
  await provider.proxyRequest(req, reply);
}