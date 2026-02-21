export const OpenAIProviderName  = "openai" as const
export type OpenAIProviderName  = typeof OpenAIProviderName
export type OpenAIModel = "gpt-4o-mini" | "gpt-4o" | "gpt-3.5-turbo" ;

export type ModelPricing = {
  input: number;
  output: number;
};

export type UsageRecord = {
  model: string;
  tokens: number;
  cost: number;
  timestamp: number;
};

export const pricing: Record<OpenAIModel, ModelPricing> = {
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4o":      { input: 5.00, output: 15.00 },
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },
};