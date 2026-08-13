import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { hmacSign, hmacVerify } from "@/lib/security/hmac";
import { verifyPassword } from "@/lib/security/password";
import { getAdminSessionSecret } from "@/lib/security/session-secrets";

import { ADMIN_COOKIE } from "@/lib/admin/session-edge";

export { ADMIN_COOKIE };
const MAX_AGE_SEC = 60 * 60 * 8; // 8h

export type AdminSession = {
  email: string;
  exp: number;
};

function sessionSecret() {
  return getAdminSessionSecret();
}

export function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function adminAuthConfigured() {
  const hasPassword = Boolean(
    process.env.ADMIN_PASSWORD_HASH?.trim() ||
    process.env.ADMIN_PASSWORD?.trim(),
  );
  return Boolean(hasPassword && getAllowedAdminEmails().length);
}

export function createAdminSessionToken(email: string) {
  const payload: AdminSession = {
    email: email.toLowerCase().trim(),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmacSign(sessionSecret(), body)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
): AdminSession | null {
  if (!token || !token.includes(".")) return null;
  try {
    const secret = sessionSecret();
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    if (!hmacVerify(secret, body, sig)) return null;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as AdminSession;
    if (!payload?.email || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    const allowed = getAllowedAdminEmails();
    if (!allowed.includes(payload.email.toLowerCase())) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hash) {
    return verifyPassword(password, hash);
  }

  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(Buffer.from(expected), Buffer.from(expected));
    return false;
  }
  return timingSafeEqual(a, b);
}

export function setAdminSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export function clearAdminSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getSessionFromRequest(req: NextRequest): AdminSession | null {
  return verifyAdminSessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

export async function getSessionFromCookies(): Promise<AdminSession | null> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}
