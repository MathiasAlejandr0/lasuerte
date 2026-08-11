import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, parseDateRange } from "@/lib/admin/auth";
import {
  buildAffiliateStats,
  buildOrphanReferralStats,
  buildPackMix,
  buildProviderMix,
  buildSalesKpis,
} from "@/lib/admin/analytics";
import { getRaffle } from "@/lib/catalog/store";
import {
  listAffiliates,
  listOrderItems,
  listOrders,
  listPayouts,
  listTickets,
  paymentsMockEnabled,
} from "@/lib/db/orders";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { from, to } = parseDateRange(req);
    const [orders, affiliates, items, payouts, tickets] = await Promise.all([
      listOrders(),
      listAffiliates(),
      listOrderItems(),
      listPayouts(),
      listTickets(),
    ]);

    const kpis = buildSalesKpis(orders, from, to);
    const affiliateStats = buildAffiliateStats(
      affiliates,
      orders,
      payouts,
      from,
      to,
    );
    const orphanCodes = buildOrphanReferralStats(affiliates, orders, from, to);
    const providerMix = buildProviderMix(orders, from, to);
    const packMix = buildPackMix(orders, items, from, to);
    const totalBalance = affiliateStats.reduce(
      (acc, a) => acc + a.commissionBalanceClp,
      0,
    );
    const totalEarned = affiliateStats.reduce(
      (acc, a) => acc + a.commissionEarnedClp,
      0,
    );

    const raffle = getRaffle();
    const ops = {
      paymentsMock: paymentsMockEnabled(),
      mercadoPagoConfigured: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
      webpayConfigured: Boolean(
        process.env.WEBPAY_API_KEY && process.env.WEBPAY_ENV === "production",
      ),
      supabaseConfigured: isSupabaseConfigured(),
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
      liveStreamConfigured: Boolean(raffle.liveStreamUrl?.trim()),
      raffleStatus: raffle.raffleStatus === "closed" ? "closed" : "open",
      winnerConfigured:
        raffle.winnerTicketNumber != null &&
        Number(raffle.winnerTicketNumber) > 0,
    };

    return NextResponse.json({
      kpis: {
        ...kpis,
        commissionsOwedClp: totalBalance,
        commissionsEarnedClp: totalEarned,
        ticketsIssued: tickets.filter((t) => {
          const order = orders.find((o) => o.id === t.order_id);
          if (!order || order.status !== "paid") return false;
          const ts = new Date(order.paid_at || order.created_at).getTime();
          return ts >= from.getTime() && ts <= to.getTime();
        }).length,
      },
      affiliateStats: affiliateStats.slice(0, 5),
      orphanCodes,
      providerMix,
      packMix,
      ops,
      alerts: {
        pendingOrders: kpis.ordersPending,
        orphanCodes: orphanCodes.length,
        unpaidCommissions: affiliateStats.filter(
          (a) => a.commissionBalanceClp > 0,
        ).length,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar el resumen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
