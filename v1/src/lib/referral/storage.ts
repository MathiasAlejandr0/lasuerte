const STORAGE_KEY = "suertu2s_ref_code";

/** Códigos tipo STJP48 / DEMO01 — letras y números, 2–32. */
export function normalizeReferralCode(raw: string | null | undefined) {
  if (!raw) return null;
  const code = raw.toUpperCase().trim();
  if (!/^[A-Z0-9_-]{2,32}$/.test(code)) return null;
  return code;
}

export function saveReferralCode(code: string) {
  const normalized = normalizeReferralCode(code);
  if (!normalized || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    // ignore quota / private mode
  }
}

export function readReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeReferralCode(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}
