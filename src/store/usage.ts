type UsageRecord = {
  model: string;
  tokens: number;
  cost: number;
  timestamp: number;
};

const usage: UsageRecord[] = [];

export function logUsage(record: UsageRecord) {
  usage.push(record);
  console.log("USAGE LOGGED:", record);
}

export function getUsage() {
  return usage;
}