import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthorized } from "@/lib/admin/auth";
import {
  adminAuthConfigured,
  getAllowedAdminEmails,
} from "@/lib/admin/session";
import {
  getPacks,
  getPrizes,
  getRaffle,
  replacePacks,
  replacePrizes,
  updateRaffle,
} from "@/lib/catalog/store";
import { paymentsMockEnabled } from "@/lib/db/orders";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { logServerError, publicError } from "@/lib/security/errors";

function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function envPayload() {
  const adminEmails = getAllowedAdminEmails();
  return {
    paymentsMock: paymentsMockEnabled(),
    supabaseConfigured: isSupabaseConfigured(),
    adminAuthConfigured: adminAuthConfigured(),
    mercadoPagoConfigured: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
    webpayConfigured: Boolean(
      process.env.WEBPAY_API_KEY && process.env.WEBPAY_ENV === "production",
    ),
    emailConfigured: emailConfigured(),
    adminSessionSecretConfigured: Boolean(
      process.env.ADMIN_SESSION_SECRET?.trim(),
    ),
    adminPasswordHashed: Boolean(process.env.ADMIN_PASSWORD_HASH?.trim()),
    adminEmailsCount: adminEmails.length,
    adminEmailsMasked: adminEmails.map((e) => {
      const [user, domain] = e.split("@");
      if (!domain) return "***";
      return `${user.slice(0, 2)}***@${domain}`;
    }),
  };
}

function settingsPayload() {
  return {
    raffle: getRaffle(),
    prizes: getPrizes(),
    packs: getPacks(),
    env: envPayload(),
  };
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json(settingsPayload());
}

const packSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(120),
  priceClp: z.number().int().positive().max(10_000_000),
  ticketCount: z.number().int().positive().max(1000),
  featured: z.boolean().optional(),
});

const prizeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(200),
  costClp: z.number().int().nonnegative().max(100_000_000),
});

const putSchema = z.object({
  raffle: z
    .object({
      title: z.string().min(3).max(200),
      prizeName: z.string().min(2).max(200),
      endsAt: z.string().min(8),
      ticketMin: z.number().int().positive().optional(),
      ticketMax: z.number().int().positive().optional(),
      estimatedOpsCostClp: z.number().int().nonnegative().max(100_000_000),
      liveStreamUrl: z
        .string()
        .max(500)
        .refine(
          (v) =>
            !v.trim() ||
            /^https?:\/\//i.test(v.trim()) ||
            /^[\w.-]+\.[a-z]{2,}/i.test(v.trim()),
          "El link del live no es válido",
        )
        .optional(),
      raffleStatus: z.enum(["open", "closed"]).optional(),
      winnerTicketNumber: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),
      winnerName: z.string().max(120).optional(),
      winnerNote: z.string().max(300).optional(),
    })
    .optional(),
  prizes: z.array(prizeSchema).min(1).max(30).optional(),
  packs: z.array(packSchema).min(1).max(20).optional(),
});

export async function PUT(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = putSchema.parse(await req.json());

    if (body.raffle) {
      const ends = new Date(body.raffle.endsAt);
      if (Number.isNaN(ends.getTime())) {
        return NextResponse.json(
          { error: "La fecha de cierre no es válida" },
          { status: 400 },
        );
      }
      if (
        body.raffle.ticketMin != null &&
        body.raffle.ticketMax != null &&
        body.raffle.ticketMin >= body.raffle.ticketMax
      ) {
        return NextResponse.json(
          { error: "El número mínimo debe ser menor al máximo" },
          { status: 400 },
        );
      }

      const current = getRaffle();
      const ticketMin = body.raffle.ticketMin ?? current.ticketMin;
      const ticketMax = body.raffle.ticketMax ?? current.ticketMax;
      if (
        body.raffle.winnerTicketNumber != null &&
        (body.raffle.winnerTicketNumber < ticketMin ||
          body.raffle.winnerTicketNumber > ticketMax)
      ) {
        return NextResponse.json(
          {
            error: `El número ganador debe estar entre ${ticketMin} y ${ticketMax}`,
          },
          { status: 400 },
        );
      }

      updateRaffle({
        ...body.raffle,
        endsAt: ends.toISOString(),
      });
    }

    if (body.prizes) {
      replacePrizes(body.prizes);
    }

    if (body.packs) {
      replacePacks(body.packs);
    }

    return NextResponse.json({
      ok: true,
      ...settingsPayload(),
    });
  } catch (error) {
    logServerError("admin/settings", error);
    return NextResponse.json(
      {
        error: publicError(error, "No se pudo guardar", { allowZod: true }),
      },
      { status: 400 },
    );
  }
}
