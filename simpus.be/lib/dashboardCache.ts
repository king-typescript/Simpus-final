const cache = new Map<string, { data: unknown; expiresAt: number }>();

export const DASHBOARD_TTL_MS = 15_000;

export function getCachedDashboard(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCachedDashboard(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + DASHBOARD_TTL_MS });
}

export function invalidateDashboardCache() {
  cache.clear();
}
