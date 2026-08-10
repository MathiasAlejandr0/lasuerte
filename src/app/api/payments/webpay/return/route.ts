import { NextRequest, NextResponse } from "next/server";
import { commitWebpayTransaction } from "@/lib/payments/webpay";
import { fulfillOrder, getOrder, markOrderFailed } from "@/lib/db/orders";
import { deliverOrderConfirmation } from "@/lib/email/deliver-confirmation";
import { logServerError } from "@/lib/security/errors";

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const orderId = req.nextUrl.searchParams.get("orderId");
  const token =
    req.nextUrl.searchParams.get("token_ws") ||
    (await req.formData().catch(() => null))?.get("token_ws")?.toString();

  if (!orderId || !token) {
    return NextResponse.redirect(`${site}/pago/error`);
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.redirect(`${site}/pago/error?orderId=${orderId}`);
    }

    const result = await commitWebpayTransaction(token);
    const approved =
      result.response_code === 0 &&
      (result.status === "AUTHORIZED" || result.status === "authorized");

    if (!approved) {
      await markOrderFailed(orderId);
      return NextResponse.redirect(`${site}/pago/error?orderId=${orderId}`);
    }

    const expectedBuyOrder = orderId.replace(/-/g, "").slice(0, 26);
    const buyOrder = String(result.buy_order || "");
    const sessionId = String(result.session_id || "");
    const amount = Number(result.amount);

    if (buyOrder && buyOrder !== expectedBuyOrder) {
      logServerError(
        "payments/webpay/return",
        new Error(
          `buy_order no coincide: ${buyOrder} vs ${expectedBuyOrder}`,
        ),
      );
      await markOrderFailed(orderId);
      return NextResponse.redirect(`${site}/pago/error?orderId=${orderId}`);
    }

    if (sessionId && sessionId !== orderId && !orderId.startsWith(sessionId)) {
      if (sessionId.slice(0, 61) !== orderId.slice(0, 61)) {
        logServerError(
          "payments/webpay/return",
          new Error(`session_id no coincide para el pedido ${orderId}`),
        );
        await markOrderFailed(orderId);
        return NextResponse.redirect(`${site}/pago/error?orderId=${orderId}`);
      }
    }

    if (Number.isFinite(amount) && Math.round(amount) !== order.total_clp) {
      logServerError(
        "payments/webpay/return",
        new Error(
          `monto no coincide pedido=${orderId} esperado=${order.total_clp} recibido=${amount}`,
        ),
      );
      await markOrderFailed(orderId);
      return NextResponse.redirect(`${site}/pago/error?orderId=${orderId}`);
    }

    await fulfillOrder(orderId);
    await deliverOrderConfirmation(orderId);
    return NextResponse.redirect(`${site}/pago/exito?orderId=${orderId}`);
  } catch (error) {
    logServerError("payments/webpay/return", error);
    await markOrderFailed(orderId);
    return NextResponse.redirect(`${site}/pago/error?orderId=${orderId}`);
  }
}
