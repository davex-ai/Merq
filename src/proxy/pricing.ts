import type { OpenAIModel } from '../types/openai.js'
import type { ModelPricing } from '../types/openai.js'

export function calculateCost(
  model: OpenAIModel,
  usage: { prompt_tokens: number; completion_tokens: number }
): number {//why is number here when all parameters have defined their types
  const p = pricing[model];//what is this doing ? pricing isnt an array so why is it accesing model like that

  // i still dont understand this calculation
  return (
    (usage.prompt_tokens / 1_000_000) * p.input +
    (usage.completion_tokens / 1_000_000) * p.output
  );
}

const pricing: Record<OpenAIModel, ModelPricing> = {//why you using a record
  "gpt-4o-mini": { //isnt it supposed to be a , and not : arent they diffent related parameters like Map<Dog. Age>
    //are these defaut input propmt cost per milllion token for open ai or gpt 4
    input: 0.15,
    output: 0.60,
  },
};