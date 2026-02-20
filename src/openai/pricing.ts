import type { OpenAIModel } from '../types/openai.js'
import type { ModelPricing } from '../types/openai.js'

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

const pricing: Record<OpenAIModel, ModelPricing> = {
  "gpt-4o-mini": { 
    
    input: 0.15,
    output: 0.60,
  },
};