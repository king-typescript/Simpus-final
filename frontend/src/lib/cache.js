/**
 * In-memory client cache untuk Single Page Application (SPA).
 * Mencegah flicker data dan memberikan navigasi instan (0 ms) antar tab.
 */

const cacheStore = new Map();

export const apiCache = {
  get(key) {
    const item = cacheStore.get(key);
    if (!item) return null;
    const now = Date.now();
    if (now > item.expiresAt) {
      cacheStore.delete(key);
      return null;
    }
    return item.data;
  },

  set(key, data, ttlMs = 60000) {
    cacheStore.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  },

  remove(key) {
    cacheStore.delete(key);
  },

  invalidate(pattern) {
    if (!pattern) {
      cacheStore.clear();
      return;
    }
    for (const key of cacheStore.keys()) {
      if (key.includes(pattern)) {
        cacheStore.delete(key);
      }
    }
  },

  clear() {
    cacheStore.clear();
  },
};

export default apiCache;
