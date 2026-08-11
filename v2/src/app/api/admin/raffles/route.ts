import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthorized } from "@/lib/admin/auth";
import {
  createNewRaffle,
  getRaffle,
  getRaffleHistory,
} from "@/lib/catalog/store";
import { getRaffleCycleStats } from "@/lib/db/orders";
import { isValidRaffleCode, normalizeRaffleCode } from "@/lib/tickets/codes";
import { logServerError, publicError } from "@/lib/security/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function payload() {
  const active = getRaffle();
  return {
    active,
    history: getRaffleHistory(),
  };
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json(payload());
}

const createSchema = z.object({
  title: z.string().min(3).max(200),
  prizeName: z.string().min(2).max(200),
  code: z
    .string()
    .min(2)
    .max(12)
    .transform((v) => normalizeRaffleCode(v))
    .refine(isValidRaffleCode, "Código de sorteo inválido (A-Z / 0-9)"),
  endsAt: z.string().min(8),
  prizeCostClp: z.number().int().positive().max(100_000_000),
  opsCostClp: z.number().int().nonnegative().max(100_000_000).optional(),
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
});

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await req.json());
    const current = getRaffle();
    const stats = await getRaffleCycleStats(current.id);

    createNewRaffle(
      {
        title: body.title,
        prizeName: body.prizeName,
        code: body.code,
        endsAt: body.endsAt,
        prizeCostClp: body.prizeCostClp,
        opsCostClp: body.opsCostClp ?? 0,
        liveStreamUrl: body.liveStreamUrl ?? "",
      },
      stats,
    );

    return NextResponse.json({ ok: true, ...payload() });
  } catch (error) {
    logServerError("admin/raffles", error);
    return NextResponse.json(
      {
        error: publicError(error, "No se pudo crear el sorteo", {
          allowZod: true,
        }),
      },
      { status: 400 },
    );
  }
}
