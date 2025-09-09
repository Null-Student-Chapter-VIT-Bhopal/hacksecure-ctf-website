// lib/simpleRateLimiter.js
const ipHits = new Map();

export function rateLimit({ windowMs, max }) {
  return (req) => {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.ip ||
      "unknown";

    const now = Date.now();
    const windowStart = now - windowMs;

    if (!ipHits.has(ip)) {
      ipHits.set(ip, []);
    }

    const timestamps = ipHits.get(ip).filter((ts) => ts > windowStart);

    if (timestamps.length >= max) {
      return false; // blocked
    }

    timestamps.push(now);
    ipHits.set(ip, timestamps);

    return true; // allowed
  };
}
