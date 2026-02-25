// store/rateLimit.ts
type RateEntry = {
  count: number;
  resetAt: number;
};

import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL)

export async function checkRateLimit(
  apiKeyId: string,
  limitPerMinute: number
) {
  const minute = Math.floor(Date.now() / 60000);
  const key = `rate:${apiKeyId}:${minute}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60);
  }

  if (count > limitPerMinute) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }
}
