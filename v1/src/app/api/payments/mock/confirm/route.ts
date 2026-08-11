import { NextRequest, NextResponse } from "next/server";
import {
  fulfillOrder,
  getOrder,
  paymentsMockEnabled,
} from "@/lib/db/orders";
import { deliverOrderConfirmation } from "@/lib/email/deliver-confirmation";
import { verifyMockConfirmToken } from "@/lib/payments/mock-token";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/errors";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  const token = req.nextUrl.searchParams.get("token");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!paymentsMockEnabled()) {
    return NextResponse.redirect(`${site}/pago/error?reason=mock_disabled`);
  }

  if (!orderId || !token || !verifyMockConfirmToken(token, orderId)) {
    return NextResponse.redirect(`${site}/pago/error?reason=invalid_token`);
  }

  const limited = rateLimit({
    key: `mock-confirm:${clientIp(req)}:${orderId}`,
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.redirect(`${site}/pago/error?reason=rate_limit`);
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.redirect(`${site}/pago/error?orderId=${orderId}`);
    }

    if (
      order.payment_provider !== "mock" ||
      !order.payment_external_id?.startsWith("mock_")
    ) {
      return NextResponse.redirect(`${site}/pago/error?orderId=${orderId}`);
    }

    await fulfillOrder(orderId);
    await deliverOrderConfirmation(orderId);

    return NextResponse.redirect(`${site}/pago/exito?orderId=${orderId}`);
  } catch (error) {
    logServerError("payments/mock/confirm", error);
    return NextResponse.redirect(`${site}/pago/error?orderId=${orderId}`);
  }
}
