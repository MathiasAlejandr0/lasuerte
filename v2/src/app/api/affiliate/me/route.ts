import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedAffiliate } from "@/lib/affiliate/auth";
import { publicAffiliate } from "@/lib/affiliate/public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const affiliate = await getAuthorizedAffiliate(req);
  if (!affiliate) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    affiliate: publicAffiliate(affiliate),
  });
}
