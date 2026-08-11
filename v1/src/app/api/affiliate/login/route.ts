import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createAffiliateSessionToken,
  setAffiliateSessionCookie,
} from "@/lib/affiliate/session";
import { publicAffiliate } from "@/lib/affiliate/public";
import { findAffiliateByEmail } from "@/lib/db/orders";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { verifyPassword } from "@/lib/security/password";
import { logServerError, publicError } from "@/lib/security/errors";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit({
      key: `affiliate-login:${clientIp(req)}`,
      limit: 15,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiados intentos. Intenta más tarde." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const affiliate = await findAffiliateByEmail(email);

    const ok =
      affiliate &&
      affiliate.active &&
      affiliate.password_hash &&
      verifyPassword(body.password, affiliate.password_hash);

    if (!ok || !affiliate) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    const token = createAffiliateSessionToken(affiliate.id, email);
    const res = NextResponse.json({
      ok: true,
      affiliate: publicAffiliate(affiliate),
    });
    setAffiliateSessionCookie(res, token);
    return res;
  } catch (error) {
    logServerError("affiliate/login", error);
    return NextResponse.json(
      {
        error: publicError(error, "No se pudo iniciar sesión", {
          allowZod: true,
        }),
      },
      { status: 400 },
    );
  }
}
