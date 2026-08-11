import type { NextRequest } from "next/server";

/**
 * Mitiga CSRF en APIs autenticadas por cookie.
 * Acepta same-origin vía Origin o Referer; Sec-Fetch-Site same-origin/none/same-site.
 */
export function isSameOriginRequest(req: NextRequest): boolean {
  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host") ||
    "";
  if (!host) return false;

  const fetchSite = (req.headers.get("sec-fetch-site") || "").toLowerCase();
  if (
    fetchSite === "same-origin" ||
    fetchSite === "same-site" ||
    fetchSite === "none"
  ) {
    return true;
  }

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return originsMatch(new URL(origin).host, host);
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return originsMatch(new URL(referer).host, host);
    } catch {
      return false;
    }
  }

  // Sin Origin/Referer/Sec-Fetch-Site: rechazar mutaciones (curl sin headers, CSRF clásico)
  return false;
}

function originsMatch(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}
