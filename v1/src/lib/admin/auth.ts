import { NextRequest, NextResponse } from "next/server";
import {
  adminAuthConfigured,
  getSessionFromRequest,
} from "@/lib/admin/session";

export function isAdminAuthorized(req: NextRequest) {
  if (!adminAuthConfigured()) {
    // Sin configuración: denegar acceso admin en cualquier entorno
    return false;
  }
  return Boolean(getSessionFromRequest(req));
}

export function requireAdmin(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export function parseDateRange(req: NextRequest) {
  const fromParam = req.nextUrl.searchParams.get("from");
  const toParam = req.nextUrl.searchParams.get("to");

  const to = toParam ? new Date(toParam) : new Date();
  const from = fromParam
    ? new Date(fromParam)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (toParam && toParam.length <= 10) {
    to.setHours(23, 59, 59, 999);
  }
  if (fromParam && fromParam.length <= 10) {
    from.setHours(0, 0, 0, 0);
  }

  return { from, to };
}
