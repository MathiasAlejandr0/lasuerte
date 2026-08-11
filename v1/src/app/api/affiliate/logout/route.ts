import { NextResponse } from "next/server";
import { clearAffiliateSessionCookie } from "@/lib/affiliate/session";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAffiliateSessionCookie(res);
  return res;
}
