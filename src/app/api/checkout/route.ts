import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertRaffleAcceptsOrders } from "@/lib/catalog/orders-guard";
import {
  createOrder,
  paymentsMockEnabled,
  setPaymentExternal,
} from "@/lib/db/orders";
import { createMercadoPagoPreference } from "@/lib/payments/mercadopago";
import { createWebpayTransaction } from "@/lib/payments/webpay";
import { isMockProviderAllowed } from "@/lib/payments/mock-guard";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { logServerError, publicError } from "@/lib/security/errors";

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  rut: z.string().min(3).max(32),
  phone: z.string().min(3).max(32),
  provider: z.enum(["mercadopago", "webpay", "mock"]),
  referralCode: z.string().max(32).optional(),
  referralName: z.string().max(120).optional(),
  items: z
    .array(
      z.object({
        packId: z.string().max(64),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1)
    .max(10),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit({
      key: `checkout:${clientIp(req)}`,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta más tarde." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const body = schema.parse(await req.json());

    try {
      assertRaffleAcceptsOrders();
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "El sorteo ya está cerrado",
        },
        { status: 403 },
      );
    }

    let provider = body.provider;

    if (!isMockProviderAllowed(provider)) {
      return NextResponse.json(
        { error: "El proveedor de pago de prueba no está habilitado" },
        { status: 400 },
      );
    }

    if (paymentsMockEnabled()) {
      if (provider === "mercadopago" && !process.env.MERCADOPAGO_ACCESS_TOKEN) {
        provider = "mock";
      }
      if (
        provider === "webpay" &&
        (process.env.PAYMENTS_MOCK === "true" ||
          !process.env.WEBPAY_API_KEY ||
          process.env.WEBPAY_ENV === "integration")
      ) {
        if (process.env.PAYMENTS_MOCK === "true") provider = "mock";
      }
    }

    if (provider !== "mock" && provider === "mercadopago") {
      if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        return NextResponse.json(
          { error: "Mercado Pago no está configurado aún" },
          { status: 503 },
        );
      }
    }

    const { order } = await createOrder({ ...body, provider });
    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (provider === "mock") {
      await setPaymentExternal(order.id, `mock_${order.id}`, "mock");
      const { createMockConfirmToken } = await import(
        "@/lib/payments/mock-token"
      );
      const token = createMockConfirmToken(order.id);
      return NextResponse.json({
        orderId: order.id,
        redirectUrl: `${site}/api/payments/mock/confirm?orderId=${encodeURIComponent(order.id)}&token=${encodeURIComponent(token)}`,
        mock: true,
      });
    }

    if (provider === "mercadopago") {
      const pref = await createMercadoPagoPreference({
        orderId: order.id,
        title: "Packs Suertu2s",
        amount: order.total_clp,
        email: order.email,
      });
      await setPaymentExternal(order.id, pref.id, "mercadopago");
      return NextResponse.json({
        orderId: order.id,
        redirectUrl: pref.initPoint,
      });
    }

    const webpay = await createWebpayTransaction({
      orderId: order.id,
      amount: order.total_clp,
      sessionId: order.id,
    });
    await setPaymentExternal(order.id, webpay.token, "webpay");
    return NextResponse.json({
      orderId: order.id,
      redirectUrl: webpay.url,
      token: webpay.token,
      method: "webpay_form",
    });
  } catch (error) {
    logServerError("checkout", error);
    return NextResponse.json(
      {
        error: publicError(error, "No se pudo iniciar el pago", {
          allowZod: true,
        }),
      },
      { status: 400 },
    );
  }
}
