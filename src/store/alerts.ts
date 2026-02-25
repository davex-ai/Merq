import { getDailyCost, getMonthlyCost } from "./usage.js";
import { getBudget } from "./budgets.js";
const firedAlerts = new Set<string>();

function hasAlertFired(key: string) {
  return firedAlerts.has(key);
}

function markAlertFired(key: string) {
  firedAlerts.add(key);
}


export async function checkDailySoftAlerts(apiKeyId: string) {
  const budget = getBudget(apiKeyId);
  if (!budget?.alertThresholds) return

  const today = new Date().toISOString().slice(0, 10)
  const spent = await getDailyCost(apiKeyId, today)

  for (const threshold of budget.alertThresholds) {
    const ratio = budget.dailyLimitUsd ? spent / budget.dailyLimitUsd : 0;
    const alertKey = `${apiKeyId}:${today}:${threshold}`;

    if (ratio >= threshold && !hasAlertFired(alertKey)) {
      console.log(
        `[ALERT] API key ${apiKeyId} reached ${Math.round(
          ratio * 100
        )}% of daily budget`
      );

      // Optional webhook
      if (budget.webhookUrl) {
        fetch(budget.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKeyId,
            threshold,
            spent,
            limit: budget.dailyLimitUsd,
            date: today,
          }),
        }).catch(() => {});
      }

      markAlertFired(alertKey);
    }
  }
}

export async function checkMonthlySoftAlerts(apiKeyId: string) {
  const budget = getBudget(apiKeyId);
  if (!budget?.alertThresholds) return

  const month = new Date().toISOString().slice(0, 7)
  const spent = await getMonthlyCost(apiKeyId, month)

  for (const threshold of budget.alertThresholds) {
    const ratio = budget.monthlyLimitUsd ? spent / budget.monthlyLimitUsd : 0;
    const alertKey = `${apiKeyId}:${month}:${threshold}`;

    if (ratio >= threshold && !hasAlertFired(alertKey)) {
      console.log(
        `[ALERT] API key ${apiKeyId} reached ${Math.round(
          ratio * 100
        )}% of monthly budget`
      );

      // Optional webhook
      if (budget.webhookUrl) {
        fetch(budget.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKeyId,
            threshold,
            spent,
            limit: budget.dailyLimitUsd,
            date: month,
          }),
        }).catch(() => {});
      }

      markAlertFired(alertKey);
    }
  }
}