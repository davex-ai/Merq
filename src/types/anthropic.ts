import type { ModelPricing } from '../constants.js'
export const AnthropicProviderName  = "anthropic" as const
export type AnthropicProviderName  = typeof AnthropicProviderName

export type AnthropicModel = "Claude 3.5 Sonnet" | "Claude Opus 4.6" | "Claude Haiku 4.5";

export const pricing: Record<AnthropicModel, ModelPricing> = {
  "Claude Opus 4.6": { input: 5.00, output: 25.00 },
  "Claude Haiku 4.5": { input: 1.00, output: 5.00 },
  "Claude 3.5 Sonnet": { input: 3.00, output: 15.80 }
};