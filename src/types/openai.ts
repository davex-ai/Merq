export type Provider = "openai"

// export type OpenAIModel = "gpt-4o-mini";


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

