import { getDailyCost, getMonthlyCost } from "./usage.js";

export type Budget = {
  apiKeyId: string;
  dailyLimitUsd?: number;
  monthlyLimitUsd?: number;
  alertThresholds?: number[] ;
}

const budgets: Budget[] = [];

export function setBudget(budget: Budget) {
  budgets.push(budget);
}

function getBudget(apiKeyId: string): Budget | undefined {
  return budgets.find(b => b.apiKeyId === apiKeyId);
}

export function checkDailyBudget(apiKeyId: string) {
  const budget = getBudget(apiKeyId);
  if (!budget?.dailyLimitUsd) return;

  const today = new Date().toISOString().slice(0, 10);
  const spent = getDailyCost(apiKeyId, today);

  if (spent >= budget.dailyLimitUsd) {
    throw new Error("Daily budget exceeded");
  }
}

export function checkMonthlyBudget(apiKeyId: string) {
  const budget = getBudget(apiKeyId);
  if (!budget?.monthlyLimitUsd) return;

  const month = new Date().toISOString().slice(0, 7);
  const spent = getMonthlyCost(apiKeyId, month);

  if (spent >= budget.monthlyLimitUsd) {
    throw new Error("Monthly budget exceeded");
  }
}