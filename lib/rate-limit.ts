interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { timestamps: [] };

  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: Math.ceil((validTimestamps[0] + windowMs - now) / 1000),
    };
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, { timestamps: validTimestamps });

  // Cleanup old keys periodically
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.timestamps.every((ts) => now - ts >= windowMs)) {
        rateLimitMap.delete(k);
      }
    }
  }

  return {
    success: true,
    remaining: limit - validTimestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}
