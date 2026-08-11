import Link from "next/link";

const REASON_MESSAGES: Record<string, string> = {
  mock_disabled:
    "Los pagos de prueba no están habilitados en este momento.",
  rate_limit: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
};

export default async function PagoErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; reason?: string }>;
}) {
  const { orderId, reason } = await searchParams;
  const detail =
    (reason && REASON_MESSAGES[reason]) ||
    "Hubo un problema al procesar el pago. Puedes intentar nuevamente desde el carrito.";

  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <h1 className="font-title text-4xl font-black text-red-300">
        Pago no completado
      </h1>
      <p className="text-brand-muted leading-relaxed">{detail}</p>
      {orderId && (
        <p className="text-xs text-brand-muted/80">Pedido: {orderId}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/checkout"
          className="bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-bold uppercase px-6 py-3 rounded-full no-underline"
        >
          Reintentar
        </Link>
        <Link
          href="/carrito"
          className="border border-brand-gold/30 text-brand-cream font-bold uppercase px-6 py-3 rounded-full no-underline"
        >
          Ver carrito
        </Link>
      </div>
    </main>
  );
}
