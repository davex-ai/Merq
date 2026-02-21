//openai/pricing.ts
import { pricing } from '../types/openai.js'
import type { OpenAIModel } from '../types/openai.js'

export function calculateCost(
  model: OpenAIModel,
  usage: { prompt_tokens: number; completion_tokens: number }
): number {
  const p = pricing[model];

  return (
    (usage.prompt_tokens / 1_000_000) * p.input +
    (usage.completion_tokens / 1_000_000) * p.output
  );
}

