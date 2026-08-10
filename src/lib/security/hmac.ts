import { createHmac, timingSafeEqual } from "crypto";

/** HMAC-SHA256 → base64url (Node). Compatible con hmac-subtle del middleware. */
export function hmacSign(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function hmacVerify(
  secret: string,
  body: string,
  signature: string,
): boolean {
  const expected = hmacSign(secret, body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
