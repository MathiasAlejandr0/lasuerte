import type { NextRequest } from "next/server";
import { getAffiliateById } from "@/lib/db/orders";
import type { DbAffiliate } from "@/lib/db/types";
import { getAffiliateSessionFromRequest } from "./session";
import { publicAffiliate } from "./public";

export async function getAuthorizedAffiliate(
  req: NextRequest,
): Promise<DbAffiliate | null> {
  const session = getAffiliateSessionFromRequest(req);
  if (!session) return null;
  const affiliate = await getAffiliateById(session.affiliateId);
  if (!affiliate || !affiliate.active) return null;
  if (!affiliate.email) return null;
  if (affiliate.email.toLowerCase() !== session.email.toLowerCase()) {
    return null;
  }
  if (!affiliate.password_hash) return null;
  return affiliate;
}

export { publicAffiliate };
