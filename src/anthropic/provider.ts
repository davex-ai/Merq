//anthrpic/provider
import type { Provider } from "../providers/types.js";
import type { UsageRecord } from "../store/usage.js";
import type{ AnthropicModel } from '../types/anthropic.js'
import { logUsage } from "../store/usage.js";
import { pricing, AnthropicProviderName  } from '../types/anthropic.js'
import { tokenAmount } from '../constants.js'



function isAnthropicModel(model: string): model is AnthropicModel { return model in pricing }

export const AnthropicProvider: Provider = {
  name: AnthropicProviderName,

  calculateCost: (usage, model) => {
    if (!isAnthropicModel(model)) {
      throw new Error(`Unknown Anthropic model: ${model}`);
    }
    const p = pricing[model];
    return (
      (usage.prompt_tokens / tokenAmount) * p.input +
      (usage.completion_tokens / tokenAmount) * p.output
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
      const model = (req.body as any).model || "Claude Haiku 4.5";
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