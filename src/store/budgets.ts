import { getDailyCost, getMonthlyCost } from "./usage.js";
//budget doesnt sore in db
export type Budget = {
  apiKeyId: string;
  dailyLimitUsd?: number;
  monthlyLimitUsd?: number;
  alertThresholds?: number[];
  webhookUrl?: string;
}

const budgets: Budget[] = [];

export function setBudget(budget: Budget) {
  budgets.push(budget);
}

export function getBudget(apiKeyId: string): Budget | undefined {
  return budgets.find(b => b.apiKeyId === apiKeyId);
}

// store/budgets.ts
export async function checkDailyBudget(apiKeyId: string) {
  const budget = getBudget(apiKeyId);
  if (!budget?.dailyLimitUsd) return;

  const today = new Date().toISOString().slice(0, 10);
  const spent = await getDailyCost(apiKeyId, today);

  if (spent >= budget.dailyLimitUsd) {
    throw new Error("DAILY_BUDGET_EXCEEDED");
  }
}

export async function checkMonthlyBudget(apiKeyId: string) {
  const budget = getBudget(apiKeyId);
  if (!budget?.monthlyLimitUsd) return;

  const month = new Date().toISOString().slice(0, 7);
  const spent = await getMonthlyCost(apiKeyId, month);

  if (spent >= budget.monthlyLimitUsd) {
    throw new Error("MONTHLY_BUDGET_EXCEEDED");
  }
}