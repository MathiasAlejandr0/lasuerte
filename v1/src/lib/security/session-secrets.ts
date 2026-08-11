function isProd() {
  return process.env.NODE_ENV === "production";
}

/** Secreto HMAC de sesión admin. En prod exige ADMIN_SESSION_SECRET. */
export function getAdminSessionSecret(): string {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim();
  if (dedicated) return dedicated;

  if (isProd()) {
    throw new Error(
      "Falta ADMIN_SESSION_SECRET (obligatorio en producción; no uses ADMIN_PASSWORD como secreto de sesión)",
    );
  }

  const fallback = process.env.ADMIN_PASSWORD?.trim();
  if (!fallback) {
    throw new Error(
      "Falta ADMIN_SESSION_SECRET (o ADMIN_PASSWORD solo en desarrollo)",
    );
  }
  return fallback;
}

/** Secreto HMAC de sesión afiliado. En prod exige AFFILIATE_SESSION_SECRET o ADMIN_SESSION_SECRET. */
export function getAffiliateSessionSecret(): string {
  const dedicated = process.env.AFFILIATE_SESSION_SECRET?.trim();
  if (dedicated) return dedicated;

  const adminSession = process.env.ADMIN_SESSION_SECRET?.trim();
  if (adminSession) return adminSession;

  if (isProd()) {
    throw new Error(
      "Falta AFFILIATE_SESSION_SECRET o ADMIN_SESSION_SECRET en producción",
    );
  }

  const fallback = process.env.ADMIN_PASSWORD?.trim();
  if (!fallback) {
    throw new Error(
      "Falta AFFILIATE_SESSION_SECRET (o ADMIN_SESSION_SECRET / ADMIN_PASSWORD en desarrollo)",
    );
  }
  return fallback;
}

/** Secreto para tokens de confirmación mock (solo entornos no productivos). */
export function getMockPaymentSecret(): string {
  return (
    process.env.MOCK_PAYMENT_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "dev-mock-payment-secret"
  );
}
