"use client";

import { useState } from "react";

type Ticket = {
  code: string;
  number: number;
  orderId: string;
  createdAt?: string;
};

type LookupResult =
  | { email: string; raffleCode?: string; tickets: Ticket[] }
  | { error: string };

export function TicketLookupMini({ large = false }: { large?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [copied, setCopied] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setStatus("loading");
    setMessage("");
    setTickets(null);
    setCopied(false);
    try {
      const res = await fetch("/api/tickets/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await res.json()) as LookupResult;
      if (res.ok && "tickets" in data) {
        setTickets(data.tickets);
        setStatus("done");
        if (data.tickets.length === 0) {
          setMessage(
            "No encontramos códigos registrados para este correo. Verifica si realizaste la compra con otro email.",
          );
        }
      } else {
        setStatus("error");
        setMessage(
          "error" in data && data.error
            ? data.error
            : "No pudimos consultar tus códigos. Intenta más tarde.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("No pudimos consultar tus códigos. Intenta más tarde.");
    }
  };

  const handleCopyAll = () => {
    if (!tickets || tickets.length === 0) return;
    const allCodes = tickets
      .map((t) => t.code || String(t.number).padStart(5, "0"))
      .join(", ");
    navigator.clipboard.writeText(allCodes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`w-full ${large ? "mt-6" : "mt-2"}`}>
      <form onSubmit={onSubmit} className="space-y-3">
        <label
          htmlFor="ticket-lookup-email"
          className={`block text-brand-muted ${large ? "text-sm" : "text-[11px]"}`}
        >
          Ingresa el correo de tu compra para consultar tus códigos:
        </label>
        <div className="flex gap-2">
          <input
            id="ticket-lookup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.cl"
            className={`w-full min-w-0 bg-brand-bgLight border border-white/10 rounded-full text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-greenBright transition-all ${
              large ? "px-5 py-3 text-sm" : "px-4 py-2 text-xs"
            }`}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className={`shrink-0 bg-brand-greenBright text-black font-bold uppercase rounded-full hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(54,240,115,0.3)] ${
              large ? "px-6 py-3 text-sm" : "px-4 text-xs"
            }`}
          >
            {status === "loading" ? "Buscando…" : "Ver"}
          </button>
        </div>
      </form>

      {/* Mensajes de estado / error / sin resultados */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-2xl text-center text-xs sm:text-sm ${
            status === "error"
              ? "bg-red-950/40 border border-red-500/30 text-red-300"
              : "bg-brand-bgLight/70 border border-brand-gold/20 text-brand-muted"
          }`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </div>
      )}

      {/* Resultados: Códigos encontrados */}
      {status === "done" && tickets && tickets.length > 0 && (
        <div className="mt-6 rounded-2xl bg-black/70 border border-brand-greenBright/30 p-5 text-left shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-greenBright font-bold">
                ✓ Compra encontrada
              </span>
              <h3 className="text-base sm:text-lg font-black text-white font-title m-0">
                Tus códigos de participación ({tickets.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCopyAll}
              className="text-xs font-bold text-brand-gold hover:text-white bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 rounded-lg px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <span className="text-brand-greenBright">✓</span> ¡Copiados!
                </>
              ) : (
                <>
                  <svg
                    className="size-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copiar todos
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-brand-muted mt-2 mb-3">
            Mostrando los códigos vinculados a{" "}
            <span className="text-white font-semibold">{email}</span>:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
            {tickets.map((t, idx) => {
              const codeDisplay = t.code || String(t.number).padStart(5, "0");
              return (
                <div
                  key={`${t.orderId}-${t.code || t.number}-${idx}`}
                  className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-brand-bgLight/90 border border-brand-greenBright/30 hover:border-brand-greenBright/80 text-brand-greenBright font-mono font-bold text-sm tracking-wider shadow-sm transition-all hover:scale-[1.02]"
                >
                  {codeDisplay}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-brand-muted">
            <span>Cada código equivale a 1 oportunidad en el sorteo.</span>
            <span className="text-brand-greenBright font-semibold">
              ¡Mucha suerte! 🍀
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
