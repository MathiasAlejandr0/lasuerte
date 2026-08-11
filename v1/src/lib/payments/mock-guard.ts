import { paymentsMockEnabled } from "@/lib/db/orders";

/** Solo permite pago/confirmación de prueba si está habilitado en el entorno. */
export function assertMockPaymentsAllowed() {
  if (!paymentsMockEnabled()) {
    throw new Error("Pagos de prueba deshabilitados");
  }
}

export function isMockProviderAllowed(provider: string) {
  if (provider !== "mock") return true;
  return paymentsMockEnabled();
}
