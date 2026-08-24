import { NextResponse } from "next/server";
import { raffleAcceptsOrders } from "@/lib/catalog/orders-guard";
import { getPacks, getRaffle, syncCatalogFromDb } from "@/lib/catalog/store";
import { getPublicPaymentOptions } from "@/lib/payments/available";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Catálogo público del sitio (packs + sorteo + pagos en tiempo real desde Supabase). */
export async function GET() {
  await syncCatalogFromDb();

  return NextResponse.json(
    {
      raffle: getRaffle(),
      packs: getPacks(),
      payments: getPublicPaymentOptions(),
      acceptsOrders: raffleAcceptsOrders(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Cloudflare-CDN-Cache-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}

