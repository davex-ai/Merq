//openai/provider.ts
import type { Provider } from "../providers/types.js";
import type { OpenAIModel, UsageRecord } from "../types/openai.js";
import { logUsage } from "../store/usage.js";
import { pricing, OpenAIProviderName  } from '../types/openai.js'

export const OpenAIProvider: Provider = {
  name: OpenAIProviderName ,

  calculateCost: (usage, model) => {
    if (!(model in pricing)) {
      throw new Error(`Unknown OpenAI model: ${model}`);
    }

    const p = pricing[model as OpenAIModel];
    return (
      (usage.prompt_tokens / 1_000_000) * p.input +
      (usage.completion_tokens / 1_000_000) * p.output
    );
  },

  proxyRequest: async (req, reply) => {
    const path = req.url.replace("/merq/openai", "");
    const openaiUrl = `https://api.openai.com${path}`;

    const res = await fetch(openaiUrl, {
      method: req.method,
      headers: {
        "Authorization": req.headers.authorization!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await res.json();

    const usage = (data as any).usage;
    if (usage) {
      const model = (req.body as any).model || "gpt-4o-mini";
      const cost = OpenAIProvider.calculateCost(usage, model);

      logUsage({
        model,
        tokens: usage.total_tokens,
        cost,
        timestamp: Date.now(),
      } as UsageRecord);
    }

    reply.status(res.status).send(data);
  },
};
