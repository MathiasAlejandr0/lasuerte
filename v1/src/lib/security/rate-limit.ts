type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Rate limiter in-memory (por proceso).
 * Suficiente en un solo nodo; en multi-instancia conviene Upstash/Redis.
 */
export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(opts.key);

  if (!current || current.resetAt <= now) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }

  if (current.count >= opts.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { ok: true };
}

/**
 * IP del cliente. Solo confía en X-Forwarded-For si TRUST_PROXY=true
 * (detrás de Vercel/Cloudflare/nginx que lo setea).
 */
export function clientIp(req: Request): string {
  const trustProxy = process.env.TRUST_PROXY === "true";
  if (trustProxy) {
    const xf = req.headers.get("x-forwarded-for");
    if (xf) {
      const first = xf.split(",")[0]?.trim();
      if (first) return first;
    }
    const real = req.headers.get("x-real-ip")?.trim();
    if (real) return real;
  }
  return "unknown";
}
