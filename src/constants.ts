export const tokenAmount = 1_000_000

export type ModelPricing = {
  input: number;
  output: number;
};

export function toUTCDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}