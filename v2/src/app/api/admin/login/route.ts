import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  adminAuthConfigured,
  createAdminSessionToken,
  getAllowedAdminEmails,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin/session";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { logServerError, publicError } from "@/lib/security/errors";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit({
      key: `admin-login:${clientIp(req)}`,
      limit: 10,
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

    if (!adminAuthConfigured()) {
      return NextResponse.json(
        {
          error:
            "Admin no configurado. Define ADMIN_EMAILS y ADMIN_PASSWORD en el entorno.",
        },
        { status: 503 },
      );
    }

    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const allowed = getAllowedAdminEmails();

    if (!allowed.includes(email) || !verifyAdminPassword(body.password)) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    const token = createAdminSessionToken(email);
    const res = NextResponse.json({ ok: true, email });
    setAdminSessionCookie(res, token);
    return res;
  } catch (error) {
    logServerError("admin/login", error);
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
