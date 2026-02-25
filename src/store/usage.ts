const usage: UsageRecord[] = [];

export function logUsage(record: UsageRecord) {
  usage.push(record);
  console.log("USAGE LOGGED:", record);
}

export function getUsageByApiKey(apiKeyId: string) {
  return usage.filter(record => record.apiKeyId === apiKeyId);
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