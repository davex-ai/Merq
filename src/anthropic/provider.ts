import type { Provider } from "../types.js";
import type { UsageRecord } from "../store/usage.js";
import { logUsage } from "../../store/usage.js";

// Example: Anthropic models & pricing
export type AnthropicModel = "claude-1" | "claude-2";

const pricing: Record<AnthropicModel, { input: number; output: number }> = {
  "claude-1": { input: 0.10, output: 0.40 },
  "claude-2": { input: 0.20, output: 0.80 },
};

function isAnthropicModel(model: string): model is AnthropicModel {
  return model in pricing;
}

export const AnthropicProvider: Provider = {
  name: "anthropic",

  calculateCost: (usage, model) => {
    if (!isAnthropicModel(model)) {
      throw new Error(`Unknown Anthropic model: ${model}`);
    }
    const p = pricing[model];
    return (
      (usage.prompt_tokens / 1_000_000) * p.input +
      (usage.completion_tokens / 1_000_000) * p.output
    );
  },

  proxyRequest: async (req, reply) => {
    const path = req.url.replace("/merq/anthropic", "");
    const anthropicUrl = `https://api.anthropic.com${path}`;
    const auth = req.headers.authorization;
    const apiKeyId = auth ? auth.slice(-6) : "unknown";

    const res = await fetch(anthropicUrl, {
      method: req.method,
      headers: {
        "Authorization": auth!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await res.json();

    const usage = (data as any).usage;
    if (usage) {
      const model = (req.body as any).model || "claude-1";
      const cost = AnthropicProvider.calculateCost(usage, model);

      logUsage({
        provider: "anthropic",
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