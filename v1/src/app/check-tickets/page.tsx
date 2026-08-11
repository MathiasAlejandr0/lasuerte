"use client";

import { FormEvent, useState } from "react";

type Ticket = { number: number; orderId: string; createdAt: string };

export default function CheckTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTickets(null);
    try {
      const res = await fetch("/api/tickets/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo consultar");
      setTickets(data.tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo consultar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-title text-3xl md:text-4xl font-black text-white">
          Consultar números
        </h1>
        <p className="text-brand-muted text-sm">
          Ingresa el correo usado en la compra para ver tus números de sorteo.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="border border-brand-gold/20 rounded-2xl p-6 bg-brand-bgLight/40 space-y-4"
      >
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-brand-muted font-semibold">
            Correo electrónico
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-brand-bg border border-brand-gold/20 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-greenBright"
            placeholder="tu@correo.cl"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-extrabold uppercase py-3.5 rounded-full border-none cursor-pointer disabled:opacity-60"
        >
          {loading ? "Buscando..." : "Consultar"}
        </button>
      </form>

      {error && (
        <p className="text-red-300 text-sm text-center border border-red-400/30 rounded-lg p-3">
          {error}
        </p>
      )}

      {tickets && (
        <div className="border border-brand-gold/20 rounded-2xl p-6 bg-brand-bg/80 space-y-4">
          {tickets.length === 0 ? (
            <p className="text-brand-muted text-center">
              No encontramos números para este correo.
            </p>
          ) : (
            <>
              <h2 className="text-white font-bold">
                Tus números ({tickets.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {tickets.map((t) => (
                  <span
                    key={`${t.orderId}-${t.number}`}
                    className="px-3 py-2 rounded-lg bg-brand-bgLight border border-brand-greenBright/30 text-brand-greenBright font-bold"
                  >
                    {String(t.number).padStart(5, "0")}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
