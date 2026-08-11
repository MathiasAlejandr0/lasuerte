import { NextResponse } from "next/server";
import { raffleAcceptsOrders } from "@/lib/catalog/orders-guard";
import { getPacks, getRaffle } from "@/lib/catalog/store";
import { getPublicPaymentOptions } from "@/lib/payments/available";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Catálogo público del sitio (packs + sorteo + pagos). */
export async function GET() {
  return NextResponse.json(
    {
      raffle: getRaffle(),
      packs: getPacks(),
      payments: getPublicPaymentOptions(),
      acceptsOrders: raffleAcceptsOrders(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
