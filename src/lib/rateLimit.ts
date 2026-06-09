import "server-only";

type Bucket = {
  count: number;
  resetAtMs: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit({
  key,
  limit,
  windowMs,
  nowMs = Date.now(),
}: {
  key: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
}): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const existing = buckets.get(key);

  if (!existing || nowMs >= existing.resetAtMs) {
    buckets.set(key, { count: 1, resetAtMs: nowMs + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAtMs - nowMs) / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { ok: true };
}

export function getClientIp(request: Request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

