import { calcCommission } from "@/lib/admin/analytics";
import type {
  DbAffiliate,
  DbAffiliatePayout,
  DbOrder,
} from "@/lib/db/types";
import { publicAffiliate } from "./public";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}***@${domain}`;
}

export function buildAffiliatePortalDashboard(
  affiliate: DbAffiliate,
  orders: DbOrder[],
  payouts: DbAffiliatePayout[],
  siteUrl: string,
) {
  const code = affiliate.code.toUpperCase();
  const related = orders
    .filter((o) => o.status === "paid")
    .filter(
      (o) =>
        o.affiliate_id === affiliate.id ||
        (o.referral_code && o.referral_code.toUpperCase() === code),
    )
    .sort((a, b) => {
      const ta = new Date(a.paid_at || a.created_at).getTime();
      const tb = new Date(b.paid_at || b.created_at).getTime();
      return tb - ta;
    });

  const salesClp = related.reduce((a, o) => a + o.total_clp, 0);
  const commissionEarnedClp = related.reduce(
    (a, o) => a + calcCommission(o.total_clp, affiliate),
    0,
  );

  const myPayouts = payouts
    .filter((p) => p.affiliate_id === affiliate.id)
    .sort(
      (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime(),
    );
  const commissionPaidClp = myPayouts.reduce((a, p) => a + p.amount_clp, 0);

  const base = siteUrl.replace(/\/$/, "");
  const shareUrl = `${base}/?ref=${encodeURIComponent(code)}`;

  return {
    affiliate: publicAffiliate(affiliate),
    shareUrl,
    summary: {
      ordersPaid: related.length,
      salesClp,
      commissionEarnedClp,
      commissionPaidClp,
      commissionBalanceClp: commissionEarnedClp - commissionPaidClp,
      commissionLabel:
        affiliate.commission_type === "percent"
          ? `${affiliate.commission_value}% por venta`
          : `$${Math.round(affiliate.commission_value).toLocaleString("es-CL")} fijo por venta`,
    },
    recentSales: related.slice(0, 25).map((o) => ({
      id: o.id,
      paidAt: o.paid_at || o.created_at,
      totalClp: o.total_clp,
      emailMasked: maskEmail(o.email),
      commissionClp: calcCommission(o.total_clp, affiliate),
    })),
    payouts: myPayouts.map((p) => ({
      id: p.id,
      amountClp: p.amount_clp,
      paidAt: p.paid_at,
      periodFrom: p.period_from,
      periodTo: p.period_to,
      note: p.note,
    })),
  };
}
