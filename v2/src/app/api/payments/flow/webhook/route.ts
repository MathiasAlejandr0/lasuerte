import { NextRequest, NextResponse } from "next/server";
import { fulfillOrder, getOrder } from "@/lib/db/orders";
import { deliverOrderConfirmation } from "@/lib/email/deliver-confirmation";
import { getFlowPaymentStatus } from "@/lib/payments/flow";
import { logServerError } from "@/lib/security/errors";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit({
      key: `flow-webhook:${clientIp(req)}`,
      limit: 120,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes" },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    let token = "";
    try {
      const formData = await req.formData();
      token = String(formData.get("token") || "");
    } catch {
      const json = await req.json().catch(() => ({}));
      token = String(json?.token || "");
    }

    if (!token) {
      token = req.nextUrl.searchParams.get("token") || "";
    }

    if (!token) {
      return NextResponse.json({ ok: true, skipped: true, reason: "no_token" });
    }

    const flowStatus = await getFlowPaymentStatus(token);

    // Status 2 = Pagado en Flow
    if (flowStatus.status !== 2) {
      return NextResponse.json({ ok: true, status: flowStatus.status });
    }

    const orderId = flowStatus.commerceOrder;
    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ ok: true, missing: true });
    }

    if (Math.round(flowStatus.amount) !== order.total_clp) {
      logServerError(
        "payments/flow/webhook",
        new Error(
          `Monto Flow no coincide pedido=${order.id} esperado=${order.total_clp} recibido=${flowStatus.amount}`,
        ),
      );
      return NextResponse.json({ error: "Monto no coincide" }, { status: 400 });
    }

    await fulfillOrder(order.id);
    const email = await deliverOrderConfirmation(order.id);

    return NextResponse.json({ ok: true, email });
  } catch (error) {
    logServerError("payments/flow/webhook", error);
    return NextResponse.json(
      { error: "No se pudo procesar la notificación de pago Flow" },
      { status: 500 },
    );
  }
}
