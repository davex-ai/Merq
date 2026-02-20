import type { UsageRecord } from '../types/openai.js'
const usage: UsageRecord[] = [];

export function logUsage(record: UsageRecord) {
  usage.push(record);
  console.log("USAGE LOGGED:", record);
}

export function getUsage() {
  return usage;
}