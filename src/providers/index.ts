import type { FastifyRequest, FastifyReply } from "fastify";
import type { Provider } from "./types.js";
import { OpenAIProvider } from "../openai/provider.js";
import { AnthropicProvider } from "../anthropic/provider.js";
import { checkDailyBudget, checkMonthlyBudget } from "../store/budgets.js";

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

  const auth = req.headers.authorization;
  const apiKeyId = auth ? auth.slice(-6) : "unknown";

  try {
    checkDailyBudget(apiKeyId);
  } catch (err) {
    return reply.status(402).send({
      error: "Daily budget exceeded",
    });
  }
  
  try {
    checkMonthlyBudget(apiKeyId);
  } catch (err) {
    return reply.status(402).send({
      error: "Monthly budget exceeded",
    });
  }

  await provider.proxyRequest(req, reply);
}