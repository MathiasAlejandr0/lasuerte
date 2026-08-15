import { NextRequest, NextResponse } from "next/server";
import { fulfillOrder, markOrderFailed } from "@/lib/db/orders";
import { deliverOrderConfirmation } from "@/lib/email/deliver-confirmation";
import { getFlowPaymentStatus } from "@/lib/payments/flow";
import { logServerError } from "@/lib/security/errors";

export async function GET(req: NextRequest) {
  return handleReturn(req);
}

export async function POST(req: NextRequest) {
  return handleReturn(req);
}

async function handleReturn(req: NextRequest) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    let token = req.nextUrl.searchParams.get("token") || "";

    if (!token && req.method === "POST") {
      try {
        const formData = await req.formData();
        token = String(formData.get("token") || "");
      } catch {
        const json = await req.json().catch(() => ({}));
        token = String(json?.token || "");
      }
    }

    if (!token) {
      return NextResponse.redirect(`${site}/pago/error?reason=no_token`);
    }

    const flowStatus = await getFlowPaymentStatus(token);
    const orderId = flowStatus.commerceOrder;

    if (flowStatus.status === 2) {
      // Pagado con éxito
      await fulfillOrder(orderId);
      await deliverOrderConfirmation(orderId);
      return NextResponse.redirect(
        `${site}/pago/exito?orderId=${encodeURIComponent(orderId)}`,
      );
    } else {
      // Rechazado (3), Anulado (4) o Pendiente (1)
      await markOrderFailed(orderId);
      return NextResponse.redirect(
        `${site}/pago/error?orderId=${encodeURIComponent(orderId)}&status=${flowStatus.status}`,
      );
    }
  } catch (error) {
    logServerError("payments/flow/return", error);
    return NextResponse.redirect(`${site}/pago/error?reason=flow_error`);
  }
}
