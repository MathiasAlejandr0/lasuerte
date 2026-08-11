import { hmacSign, hmacVerify } from "@/lib/security/hmac";
import { getMockPaymentSecret } from "@/lib/security/session-secrets";

const TTL_SEC = 60 * 60; // 1h

type Payload = { orderId: string; exp: number };

export function createMockConfirmToken(orderId: string): string {
  const payload: Payload = {
    orderId,
    exp: Math.floor(Date.now() / 1000) + TTL_SEC,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmacSign(getMockPaymentSecret(), body)}`;
}

export function verifyMockConfirmToken(
  token: string | null | undefined,
  orderId: string,
): boolean {
  if (!token || !token.includes(".")) return false;
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return false;
    if (!hmacVerify(getMockPaymentSecret(), body, sig)) return false;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Payload;
    if (!payload?.orderId || !payload.exp) return false;
    if (payload.orderId !== orderId) return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}
