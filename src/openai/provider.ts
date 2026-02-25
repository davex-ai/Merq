//openai/provider.ts
import type { Provider } from "../providers/types.js";
import type { OpenAIModel,  } from "../types/openai.js";
import { logUsage } from "../store/usage.js";
import type { UsageRecord } from "../store/usage.js";
import { pricing, OpenAIProviderName  } from '../types/openai.js'
import { tokenAmount } from '../constants.js'

function isOpenAIModel(model :string) :model is OpenAIModel{ return model in pricing }

export const OpenAIProvider: Provider = {
  name: OpenAIProviderName,

  calculateCost: (usage, model) => {
    if (!isOpenAIModel(model)) {
      throw new Error(`Unknown OpenAI model: ${model}`);
    }

    const p = pricing[model];
    return (
      (usage.prompt_tokens / tokenAmount) * p.input +
      (usage.completion_tokens / tokenAmount) * p.output
    );
  },

  proxyRequest: async (req, reply) => {
    const path = req.url.replace("/merq/openai", "");
    const openaiUrl = `https://api.openai.com${path}`;
    const auth = req.headers.authorization
    const apiKeyId = auth ? auth.slice(-6) : "unknown"

    const res = await fetch(openaiUrl, {
      method: req.method,
      headers: {
        "Authorization":auth!,
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
        provider: OpenAIProviderName,
        apiKeyId,
        model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        cost,
        timestamp: Date.now(),
      });
    }

    reply.status(res.status).send(data);
  },
};
