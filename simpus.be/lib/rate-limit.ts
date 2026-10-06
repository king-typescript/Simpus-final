type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const MAX_MAP_ENTRIES = 10000;
const rateLimitMap = new Map<string, RateLimitRecord>();

function cleanupExpired(now: number) {
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Cleanup periodically
if (typeof setInterval !== "undefined") {
  const interval = setInterval(() => {
    cleanupExpired(Date.now());
  }, 60000);
  if (interval.unref) {
    interval.unref();
  }
}

export function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Prevent memory exhaustion: enforce bounded cache size
    if (rateLimitMap.size >= MAX_MAP_ENTRIES) {
      cleanupExpired(now);
      if (rateLimitMap.size >= MAX_MAP_ENTRIES) {
        const oldestKey = rateLimitMap.keys().next().value;
        if (oldestKey) rateLimitMap.delete(oldestKey);
      }
    }

    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const candidate = forwardedFor.split(",")[0].trim();
    if (candidate) return candidate.slice(0, 45);
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    const candidate = realIp.trim();
    if (candidate) return candidate.slice(0, 45);
  }
  return "127.0.0.1";
}
