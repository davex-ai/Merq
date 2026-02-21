import type { FastifyRequest, FastifyReply } from "fastify";
import type { Provider } from "./types.js";
import { logUsage } from "../store/usage.js";
import { tokenAmount } from "../constants.js";
import type { UsageRecord } from "../store/usage.js";

type PricingTable = Record<string, { input: number; output: number }>;

type BaseProviderConfig = {
  name: string;
  baseUrl: string;
  pricing: PricingTable;
  defaultModel: string;
};

export function createBaseProvider(config: BaseProviderConfig): Provider {
  return {
    name: config.name,

    calculateCost(usage, model) {
      const p = config.pricing[model];
      if (!p) throw new Error(`Unknown model for ${config.name}: ${model}`);

      return (
        (usage.prompt_tokens / tokenAmount) * p.input +
        (usage.completion_tokens / tokenAmount) * p.output
      );
    },

    async proxyRequest(req: FastifyRequest, reply: FastifyReply) {
      const path = req.url.replace(`/merq/${config.name}`, "");
      const url = `${config.baseUrl}${path}`;

      const auth = req.headers.authorization;
      const apiKeyId = auth ? auth.slice(-6) : "unknown";

      const res = await fetch(url, {
        method: req.method,
        headers: {
          Authorization: auth!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await res.json();

      const usage = (data as any).usage;
      if (usage) {
        const model = (req.body as any).model || config.defaultModel;
        const cost = this.calculateCost(usage, model);

        logUsage({
          provider: config.name,
          apiKeyId,
          model,
          tokens: usage.total_tokens,
          cost,
          timestamp: Date.now(),
        } as UsageRecord);
      }

      reply.status(res.status).send(data);
    },
  };
}