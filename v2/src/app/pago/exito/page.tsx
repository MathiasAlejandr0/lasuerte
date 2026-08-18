"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ExitoContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const pending = params.get("pending");

  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <h1 className="font-title text-4xl font-black text-brand-greenBright">
        {pending ? "Pago en proceso" : "¡Pago exitoso!"}
      </h1>
      <p className="text-brand-muted leading-relaxed">
        {pending
          ? "Tu pago está siendo confirmado. Te enviaremos las ilustraciones y los tickets por correo apenas se acredite."
          : "Gracias por tu compra. Tus ilustraciones y tickets de participación fueron enviados a tu correo."}
      </p>
      {orderId ? (
        <p className="text-xs text-brand-muted/80">Pedido: {orderId}</p>
      ) : null}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/check-tickets"
          className="bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-bold uppercase px-6 py-3 rounded-full no-underline"
        >
          Consultar tickets
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

export default function PagoExitoPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-xl mx-auto px-4 py-16 text-center">
          <p className="text-brand-muted">Cargando…</p>
        </main>
      }
    >
      <ExitoContent />
    </Suspense>
  );
}
