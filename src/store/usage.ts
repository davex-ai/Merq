import { toUTCDateString } from "../constants.js";
import { checkDailySoftAlerts, checkMonthlySoftAlerts } from "./alerts.js";

const usage: UsageRecord[] = [];

export async function logUsage(record: UsageRecord)  {
  usage.push(record);

  const date = toUTCDateString(record.timestamp)
  addDailyUsage(record.apiKeyId, date, record.cost, record.tokens)
  console.log("USAGE LOGGED:", record);
  await checkDailySoftAlerts(record.apiKeyId)
  await checkMonthlySoftAlerts(record.apiKeyId)
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

type DailyAggregate = {
  apiKeyId: string;
  date: string; 
  totalCost: number;
  totalTokens: number;
};

const daily: Record<string, DailyAggregate> = {};

function makeKey(apiKeyId: string, date: string) {
  return `${apiKeyId}:${date}`;
}

export function addDailyUsage(
  apiKeyId: string,
  date: string,
  cost: number,
  tokens: number
) {
  const key = makeKey(apiKeyId, date);

  if (!daily[key]) {
    daily[key] = {
      apiKeyId,
      date,
      totalCost: 0,
      totalTokens: 0,
    };
  }

  daily[key].totalCost += cost;
  daily[key].totalTokens += tokens;
}

export function getDailyUsage(apiKeyId: string, date?: string) {
  return Object.values(daily).filter(d =>
    d.apiKeyId === apiKeyId && (!date || d.date === date)
  );
}

export function getMonthlyUsage(apiKeyId: string, month?: string) {
  return Object.values(daily).filter(d =>
    d.apiKeyId === apiKeyId && (!month || d.date.startsWith(month))
  );
}