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
 * IP del cliente.
 * Detecta de forma prioritaria las cabeceras de Cloudflare (cf-connecting-ip),
 * Vercel (x-real-ip) y proxies confiables (x-forwarded-for).
 */
export function clientIp(req: Request): string {
  const trustProxy =
    process.env.TRUST_PROXY === "true" ||
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.VERCEL);

  if (trustProxy) {
    // 1. Cloudflare IP header (máxima prioridad cuando el tráfico pasa por Cloudflare)
    const cfIp = req.headers.get("cf-connecting-ip")?.trim();
    if (cfIp) return cfIp;

    // 2. Vercel / Nginx real IP header
    const real = req.headers.get("x-real-ip")?.trim();
    if (real) return real;

    // 3. X-Forwarded-For header estándar (primer IP es el cliente original)
    const xf = req.headers.get("x-forwarded-for");
    if (xf) {
      const first = xf.split(",")[0]?.trim();
      if (first) return first;
    }
  }
  return "unknown";
}
