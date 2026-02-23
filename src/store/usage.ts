import { toUTCDateString } from "../constants.js";
import { checkDailySoftAlerts } from "./alerts.js";
import { addDailyUsage } from "./daily.js";

const usage: UsageRecord[] = [];

export async function logUsage(record: UsageRecord)  {
  usage.push(record);

  const date = toUTCDateString(record.timestamp)
  addDailyUsage(record.apiKeyId, date, record.cost, record.tokens)
  console.log("USAGE LOGGED:", record);
  await checkDailySoftAlerts(record.apiKeyId)
}

export function getUsageByApiKey(apiKeyId: string) {
  return usage.filter(record => record.apiKeyId === apiKeyId);
}

export function getDailyCost(apiKeyId: string, date: string): number {
  return usage
    .filter(
      u =>
        u.apiKeyId === apiKeyId &&
        new Date(u.timestamp).toISOString().slice(0, 10) === date
    )
    .reduce((sum, u) => sum + u.cost, 0);
}

export function getMonthlyCost(apiKeyId: string, yearMonth: string): number {
  return usage
    .filter(
      u =>
        u.apiKeyId === apiKeyId &&
        new Date(u.timestamp).toISOString().slice(0, 7) === yearMonth
    )
    .reduce((sum, u) => sum + u.cost, 0);
}


export function getTotalCostByKey(apiKeyId: string): number{
    return usage.filter(record => record.apiKeyId === apiKeyId)
    .reduce((sum, record) => sum + record.cost, 0)
}

export type UsageRecord = {
  provider: string;
  apiKeyId: string;
  model: string;
  tokens: number;
  cost: number;
  timestamp: number;
};