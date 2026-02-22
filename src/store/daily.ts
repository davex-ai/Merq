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