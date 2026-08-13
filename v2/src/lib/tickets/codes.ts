/** Dígitos aleatorios del código de participación (no secuenciales). */
export const TICKET_SUFFIX_DIGITS = 5;
export const TICKET_SUFFIX_MAX = 10 ** TICKET_SUFFIX_DIGITS; // 100000 → 00000..99999

const RAFFLE_CODE_RE = /^[A-Z0-9]{2,12}$/;

/** Normaliza el código del sorteo (solo A-Z / 0-9, mayúsculas). */
export function normalizeRaffleCode(raw: string): string {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function isValidRaffleCode(raw: string): boolean {
  return RAFFLE_CODE_RE.test(normalizeRaffleCode(raw));
}

/** Parte aleatoria de 5 dígitos, con ceros a la izquierda. */
export function formatTicketSuffix(suffix: number): string {
  const n = Math.trunc(Number(suffix));
  if (!Number.isFinite(n) || n < 0) return "0".repeat(TICKET_SUFFIX_DIGITS);
  return String(n % TICKET_SUFFIX_MAX).padStart(TICKET_SUFFIX_DIGITS, "0");
}

/**
 * Código de participación = código del sorteo + 5 dígitos aleatorios.
 * Ejemplo: sorteo S2S26 + 48291 → S2S2648291
 */
export function formatTicketCode(raffleCode: string, suffix: number): string {
  return `${normalizeRaffleCode(raffleCode)}${formatTicketSuffix(suffix)}`;
}

export function parseTicketCode(full: string): {
  raffleCode: string;
  suffix: number;
} | null {
  const raw = String(full || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (raw.length < TICKET_SUFFIX_DIGITS + 2) return null;
  const suffixPart = raw.slice(-TICKET_SUFFIX_DIGITS);
  if (!/^\d{5}$/.test(suffixPart)) return null;
  const raffleCode = raw.slice(0, -TICKET_SUFFIX_DIGITS);
  if (!isValidRaffleCode(raffleCode)) return null;
  return { raffleCode, suffix: Number(suffixPart) };
}

export function isValidTicketCodeForRaffle(
  full: string,
  raffleCode: string,
): boolean {
  const parsed = parseTicketCode(full);
  if (!parsed) return false;
  return parsed.raffleCode === normalizeRaffleCode(raffleCode);
}

/** Código completo desde un ticket (usa `code` si existe). */
export function ticketDisplayCode(
  ticket: { code?: string | null; number: number },
  raffleCode: string,
): string {
  const existing = String(ticket.code || "")
    .trim()
    .toUpperCase();
  if (existing) return existing;
  return formatTicketCode(raffleCode, ticket.number);
}
