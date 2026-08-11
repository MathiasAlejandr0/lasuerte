import type { NextRequest, NextResponse } from "next/server";
import { hmacSign, hmacVerify } from "@/lib/security/hmac";
import { getAffiliateSessionSecret } from "@/lib/security/session-secrets";

export const AFFILIATE_COOKIE = "suertu2s_affiliate_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14 days

export type AffiliateSession = {
  affiliateId: string;
  email: string;
  exp: number;
};

function sessionSecret() {
  return getAffiliateSessionSecret();
}

export function createAffiliateSessionToken(
  affiliateId: string,
  email: string,
) {
  const payload: AffiliateSession = {
    affiliateId,
    email: email.toLowerCase().trim(),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmacSign(sessionSecret(), body)}`;
}

export function verifyAffiliateSessionToken(
  token: string | undefined | null,
): AffiliateSession | null {
  if (!token || !token.includes(".")) return null;
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    if (!hmacVerify(sessionSecret(), body, sig)) return null;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as AffiliateSession;
    if (!payload?.affiliateId || !payload?.email || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setAffiliateSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(AFFILIATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export function clearAffiliateSessionCookie(res: NextResponse) {
  res.cookies.set(AFFILIATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getAffiliateSessionFromRequest(
  req: NextRequest,
): AffiliateSession | null {
  return verifyAffiliateSessionToken(req.cookies.get(AFFILIATE_COOKIE)?.value);
}
