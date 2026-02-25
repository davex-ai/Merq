import { pool } from "../constants.js";
import { checkDailySoftAlerts, checkMonthlySoftAlerts } from "./alerts.js";

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
      record.provider,
      record.apiKeyId,
      record.model,
      record.promptTokens,
      record.completionTokens,
      totalTokens,
      record.cost,
    ]
  );

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

  console.log("USAGE LOGGED:", record);
  await checkDailySoftAlerts(record.apiKeyId)
  await checkMonthlySoftAlerts(record.apiKeyId)
}

export async function getUsageByApiKey(apiKeyId: string) {
  const res = await pool.query(
    `
    SELECT
      provider,
      model,
      prompt_tokens,
      completion_tokens,
      total_tokens,
      cost_usd,
      created_at
    FROM usage_events
    WHERE api_key_id = $1
    ORDER BY created_at DESC
    `,
    [apiKeyId]
  );

  return res.rows;
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


export async function getTotalCostByKey(apiKeyId: string): Promise<number> {
  const res = await pool.query(
    `
    SELECT COALESCE(SUM(cost_usd), 0) AS total
    FROM usage_events
    WHERE api_key_id = $1
    `,
    [apiKeyId]
  );

  return Number(res.rows[0].total);
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

function makeKey(apiKeyId: string, date: string) {
  return `${apiKeyId}:${date}`;
}


export async function getDailyUsage(apiKeyId: string, date?: string) {
  const res = await pool.query(
    `
    SELECT date, total_tokens, total_cost_usd
    FROM daily_usage
    WHERE api_key_id = $1
    ${date ? "AND date = $2" : ""}
    ORDER BY date DESC
    `,
    date ? [apiKeyId, date] : [apiKeyId]
  );

  return res.rows;
}

export async function getMonthlyUsage(apiKeyId: string, month?: string) {
  const res = await pool.query(
    `
    SELECT month, total_tokens, total_cost_usd
    FROM monthly_usage
    WHERE api_key_id = $1
    ${month ? "AND month = $2" : ""}
    ORDER BY month DESC
    `,
    month ? [apiKeyId, `${month}-01`] : [apiKeyId]
  );

  return res.rows;
}