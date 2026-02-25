// store/rateLimit.ts
type RateEntry = {
  count: number;
  resetAt: number;
};
//ratelimits doesnt sore in db

const limits = new Map<string, RateEntry>();

export function checkRateLimit(
  apiKeyId: string,
  limitPerMinute: number
) {
  const now = Date.now();
  const windowMs = 60_000;

  const entry = limits.get(apiKeyId);

  if (!entry || entry.resetAt < now) {
    limits.set(apiKeyId, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (entry.count >= limitPerMinute) {
    throw new Error("Rate limit exceeded");
  }

  entry.count += 1;
}