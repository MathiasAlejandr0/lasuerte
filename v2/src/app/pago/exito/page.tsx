import Link from "next/link";

export default async function PagoExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; pending?: string }>;
}) {
  const { orderId, pending } = await searchParams;

  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <h1 className="font-title text-4xl font-black text-brand-greenBright">
        {pending ? "Pago en proceso" : "¡Pago exitoso!"}
      </h1>
      <p className="text-brand-muted leading-relaxed">
        {pending
          ? "Tu pago está siendo confirmado. Te enviaremos las ilustraciones y los códigos por correo apenas se acredite."
          : "Gracias por participar. Tus ilustraciones y códigos de sorteo fueron enviados a tu correo."}
      </p>
      {orderId && (
        <p className="text-xs text-brand-muted/80">Pedido: {orderId}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/check-tickets"
          className="bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-bold uppercase px-6 py-3 rounded-full no-underline"
        >
          Consultar códigos
        </Link>
        <Link
          href="/"
          className="border border-brand-gold/30 text-brand-cream font-bold uppercase px-6 py-3 rounded-full no-underline"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
