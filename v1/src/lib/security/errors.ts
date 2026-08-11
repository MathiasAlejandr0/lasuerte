/** Errores seguros para el cliente: no filtrar detalles internos. */
export function publicError(
  error: unknown,
  fallback: string,
  opts?: { allowZod?: boolean },
) {
  if (opts?.allowZod && error && typeof error === "object" && "issues" in error) {
    return "Datos inválidos";
  }
  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

export function logServerError(scope: string, error: unknown) {
  console.error(`[${scope}]`, error);
}
