import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED = 5;
const RATE_LIMIT_ENTITY = "RateLimit";

export type RateLimitKey = string | null;

/**
 * Limit failed logins per identity (school:username) AND per IP.
 * Keys[0] is the account identity; the rest are IPs. A null IP is not
 * limited by IP but the account key still applies, so lockout cannot be
 * bypassed by spoofing X-Forwarded-For.
 */
export async function isRateLimited(keys: RateLimitKey[]): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const [identity, ...ips] = keys;
  const ipList = ips.filter((ip): ip is string => ip !== null);

  if (ipList.length) {
    const byIp = await prisma.auditLog.count({
      where: {
        action: "LOGIN_FAILED",
        entityType: { not: RATE_LIMIT_ENTITY },
        ipAddress: { in: ipList },
        createdAt: { gte: since },
      },
    });
    if (byIp >= MAX_FAILED) return true;
  }

  if (!identity) return false;
  const byAccount = await prisma.auditLog.count({
    where: {
      action: "LOGIN_FAILED",
      entityType: RATE_LIMIT_ENTITY,
      entityId: identity,
      createdAt: { gte: since },
    },
  });
  return byAccount >= MAX_FAILED;
}

/** Record an account-scoped failure marker (independent of IP). */
export async function recordAccountFailure(identity: string, ip: string | null): Promise<void> {
  // ponytail: reuse AuditLog as the counter store; move to a dedicated table
  // (or in-memory bucket) when login volume makes audit rows noisy.
  await prisma.auditLog.create({
    data: {
      schoolId: null,
      userId: null,
      action: "LOGIN_FAILED",
      entityType: RATE_LIMIT_ENTITY,
      entityId: identity,
      ipAddress: ip,
    },
  }).catch(() => {});
}

// In-memory fallback helper for generic non-login rate limits
const memoryRateMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = memoryRateMap.get(key);

  if (!record || now > record.resetTime) {
    memoryRateMap.set(key, { count: 1, resetTime: now + windowMs });
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
    const parts = forwardedFor.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[0].slice(0, 45);
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim().slice(0, 45);
  }
  return "127.0.0.1";
}
