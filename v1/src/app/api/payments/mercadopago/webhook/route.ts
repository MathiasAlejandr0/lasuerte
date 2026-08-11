import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { fulfillOrder, getOrder } from "@/lib/db/orders";
import { deliverOrderConfirmation } from "@/lib/email/deliver-confirmation";
import { verifyMercadoPagoWebhook } from "@/lib/payments/mercadopago-webhook";
import { logServerError } from "@/lib/security/errors";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit({
      key: `mp-webhook:${clientIp(req)}`,
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

    const body = await req.json().catch(() => ({}));
    const paymentId = String(
      body?.data?.id ||
        req.nextUrl.searchParams.get("data.id") ||
        req.nextUrl.searchParams.get("id") ||
        "",
    );

    if (!paymentId) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({ ok: true, skipped: true, reason: "no_token" });
    }

    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
    const requireSignature =
      process.env.NODE_ENV === "production" ||
      process.env.MERCADOPAGO_REQUIRE_WEBHOOK_SECRET === "true";

    if (secret) {
      const valid = verifyMercadoPagoWebhook({
        xSignature: req.headers.get("x-signature"),
        xRequestId: req.headers.get("x-request-id"),
        dataId: paymentId,
        secret,
      });
      if (!valid) {
        return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
      }
    } else if (requireSignature) {
      logServerError(
        "payments/mercadopago/webhook",
        new Error("Falta MERCADOPAGO_WEBHOOK_SECRET"),
      );
      return NextResponse.json(
        { error: "Notificación de pago no configurada" },
        { status: 503 },
      );
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });
    const payment = new Payment(client);
    const info = await payment.get({ id: paymentId });

    if (info.status !== "approved" || !info.external_reference) {
      return NextResponse.json({ ok: true, status: info.status });
    }

    const order = await getOrder(String(info.external_reference));
    if (!order) return NextResponse.json({ ok: true, missing: true });

    if (
      typeof info.transaction_amount === "number" &&
      Math.round(info.transaction_amount) !== order.total_clp
    ) {
      logServerError(
        "payments/mercadopago/webhook",
        new Error(
          `Monto no coincide pedido=${order.id} esperado=${order.total_clp} recibido=${info.transaction_amount}`,
        ),
      );
      return NextResponse.json({ error: "Monto no coincide" }, { status: 400 });
    }

    await fulfillOrder(order.id);
    const email = await deliverOrderConfirmation(order.id);
    if (!email.sent && !email.alreadySent && email.reason) {
      logServerError(
        "payments/mercadopago/webhook",
        new Error(`Email pendiente: ${email.reason}`),
      );
    }

    return NextResponse.json({ ok: true, email });
  } catch (error) {
    logServerError("payments/mercadopago/webhook", error);
    return NextResponse.json(
      { error: "No se pudo procesar la notificación de pago" },
      { status: 500 },
    );
  }
}
