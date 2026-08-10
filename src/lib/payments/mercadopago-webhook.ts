import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify Mercado Pago webhook signature (x-signature + x-request-id).
 * https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoWebhook(opts: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
  secret: string;
}): boolean {
  if (!opts.secret || !opts.xSignature || !opts.xRequestId) return false;

  const parts = Object.fromEntries(
    opts.xSignature.split(",").map((part) => {
      const [k, v] = part.split("=");
      return [k?.trim(), v?.trim()];
    }),
  ) as Record<string, string | undefined>;

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${opts.dataId};request-id:${opts.xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", opts.secret)
    .update(manifest)
    .digest("hex");

  try {
    const a = Buffer.from(v1, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
