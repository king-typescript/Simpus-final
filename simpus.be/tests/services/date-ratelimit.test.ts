import { describe, expect, it } from "vitest";
import { getTodayDateString } from "@/lib/date";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

describe("getTodayDateString", () => {
  it("formats date in WITA (Asia/Makassar) timezone as YYYY-MM-DD", () => {
    // 2026-09-28 20:00:00 UTC is 2026-09-29 04:00:00 WITA (UTC+8)
    const testDate = new Date("2026-09-28T20:00:00.000Z");
    expect(getTodayDateString(testDate)).toBe("2026-09-29");
  });

  it("handles standard UTC daytime correctly", () => {
    const testDate = new Date("2026-09-28T04:00:00.000Z");
    expect(getTodayDateString(testDate)).toBe("2026-09-28");
  });
});

describe("rateLimit", () => {
  it("allows initial requests within limit", () => {
    const key = `test-ip-${Date.now()}`;
    const result = rateLimit(key, 3, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests when limit is exceeded", () => {
    const key = `test-ip-blocked-${Date.now()}`;
    rateLimit(key, 2, 60000); // 1st request -> remaining 1
    rateLimit(key, 2, 60000); // 2nd request -> remaining 0
    const blocked = rateLimit(key, 2, 60000); // 3rd request -> blocked
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});

describe("getClientIp", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("extracts IP from x-real-ip header when x-forwarded-for is absent", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-real-ip": "198.51.100.1" },
    });
    expect(getClientIp(req)).toBe("198.51.100.1");
  });

  it("returns fallback 127.0.0.1 when no IP headers are present", () => {
    const req = new Request("http://localhost/api");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});
