import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRaffle, syncCatalogFromDb } from "@/lib/catalog/store";
import { lookupTicketsByEmail } from "@/lib/db/orders";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { logServerError, publicError } from "@/lib/security/errors";
import { ticketDisplayCode } from "@/lib/tickets/codes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    await syncCatalogFromDb();
    const limited = rateLimit({
      key: `tickets-lookup:${clientIp(req)}`,
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiadas consultas. Intenta más tarde." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const { email } = schema.parse(await req.json());
    const tickets = await lookupTicketsByEmail(email);
    const raffleCode = getRaffle().code;
    return NextResponse.json({
      email: email.toLowerCase().trim(),
      raffleCode,
      tickets: tickets.map((t) => ({
        code: ticketDisplayCode(t, raffleCode),
        number: t.number,
        orderId: t.order_id,
        createdAt: t.created_at,
      })),
    });
  } catch (error) {
    logServerError("tickets/lookup", error);
    return NextResponse.json(
      {
        error: publicError(error, "No se pudo consultar", { allowZod: true }),
      },
      { status: 400 },
    );
  }
}
