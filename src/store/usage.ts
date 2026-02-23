import { pool, toUTCDateString } from "../constants.js";
import { checkDailySoftAlerts, checkMonthlySoftAlerts } from "./alerts.js";

const usage: UsageRecord[] = [];

export async function logUsage(record: UsageRecord)  {
   const totalTokens = record.promptTokens + record.completionTokens;
  const now = new Date();

  await pool.query(
    `
    INSERT INTO usage_events
    (api_key_id, provider, model, prompt_tokens, completion_tokens, total_tokens, cost_usd)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [
      record.apiKeyId,
      record.provider,
      record.model,
      record.promptTokens,
      record.completionTokens,
      totalTokens,
      record.cost,
    ]
  );

  // Daily aggregation
  await pool.query(
    `
    INSERT INTO daily_usage (api_key_id, date, total_tokens, total_cost_usd)
    VALUES ($1, CURRENT_DATE, $2, $3)
    ON CONFLICT (api_key_id, date)
    DO UPDATE SET
      total_tokens = daily_usage.total_tokens + EXCLUDED.total_tokens,
      total_cost_usd = daily_usage.total_cost_usd + EXCLUDED.total_cost_usd
    `,
    [record.apiKeyId, totalTokens, record.cost]
  );

  // Monthly aggregation
  await pool.query(
    `
    INSERT INTO monthly_usage (api_key_id, month, total_tokens, total_cost_usd)
    VALUES ($1, date_trunc('month', CURRENT_DATE), $2, $3)
    ON CONFLICT (api_key_id, month)
    DO UPDATE SET
      total_tokens = monthly_usage.total_tokens + EXCLUDED.total_tokens,
      total_cost_usd = monthly_usage.total_cost_usd + EXCLUDED.total_cost_usd
    `,
    [record.apiKeyId, totalTokens, record.cost]
  );

  const date = toUTCDateString(record.timestamp)
  addDailyUsage(record.apiKeyId, date, record.cost, totalTokens)
  console.log("USAGE LOGGED:", record);
  await checkDailySoftAlerts(record.apiKeyId)
  await checkMonthlySoftAlerts(record.apiKeyId)
}

export function getUsageByApiKey(apiKeyId: string) {
  return usage.filter(record => record.apiKeyId === apiKeyId);
}

export async function getDailyCost(apiKeyId: string, date: string) {
  const res = await pool.query(
    `
    SELECT total_cost_usd
    FROM daily_usage
    WHERE api_key_id = $1 AND date = $2
    `,
    [apiKeyId, date]
  );

  return res.rows[0]?.total_cost_usd ?? 0;
}

export async function getMonthlyCost(apiKeyId: string, month: string) {
  const res = await pool.query(
    `
    SELECT total_cost_usd
    FROM monthly_usage
    WHERE api_key_id = $1 AND month = $2
    `,
    [apiKeyId, `${month}-01`]
  );

  return res.rows[0]?.total_cost_usd ?? 0;
}


export function getTotalCostByKey(apiKeyId: string): number{
    return usage.filter(record => record.apiKeyId === apiKeyId)
    .reduce((sum, record) => sum + record.cost, 0)
}

export type UsageRecord = {
  provider: string;
  apiKeyId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
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