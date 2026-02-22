import { getDailyCost, getMonthlyCost } from "./usage.js";
import { getBudget } from "./budgets.js";
const firedAlerts = new Set<string>();

function hasAlertFired(key: string) {
  return firedAlerts.has(key);
}

function markAlertFired(key: string) {
  firedAlerts.add(key);
}


export async function checkSoftAlerts(apiKeyId: string) {
  const budget = getBudget(apiKeyId);
  if (!budget?.dailyLimitUsd || !budget?.monthlyLimitUsd || !budget.alertThresholds) return

  const today = new Date().toISOString().slice(0, 10)
  const spent = getDailyCost(apiKeyId, today)

  for (const threshold of budget.alertThresholds) {
    const ratio = spent / budget.dailyLimitUsd
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