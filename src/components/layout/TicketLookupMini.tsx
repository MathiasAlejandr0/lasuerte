"use client";

import { useState } from "react";

type LookupResult = { tickets: unknown[] } | { error: string };

export function TicketLookupMini({ large = false }: { large?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/tickets/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await res.json()) as LookupResult;
      if (res.ok && "tickets" in data) {
        const count = data.tickets.length;
        setStatus("done");
        setMessage(
          count > 0
            ? `¡${count} código${count > 1 ? "s" : ""} encontrado${
                count > 1 ? "s" : ""
              }! Revisa tu correo.`
            : "No encontramos códigos con ese correo todavía.",
        );
      } else {
        setStatus("error");
        setMessage(
          "error" in data && data.error
            ? data.error
            : "No pudimos consultar. Intenta más tarde.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("No pudimos consultar. Intenta más tarde.");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-2 ${large ? "mt-6" : "mt-2"}`}
    >
      <label
        htmlFor="footer-ticket-email"
        className={`block text-brand-muted ${large ? "text-sm" : "text-[11px]"}`}
      >
        Ingresa el correo de tu compra para consultar tus códigos:
      </label>
      <div className="flex gap-2">
        <input
          id="footer-ticket-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.cl"
          className={`w-full min-w-0 bg-[#07160b] border border-white/10 rounded-full text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-greenBright ${
            large ? "px-5 py-3 text-sm" : "px-4 py-2 text-xs"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`shrink-0 bg-brand-greenBright text-black font-bold uppercase rounded-full hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer ${
            large ? "px-6 py-3 text-sm" : "px-4 text-xs"
          }`}
        >
          {status === "loading" ? "…" : "Ver"}
        </button>
      </div>
      {message ? (
        <p
          className={`leading-snug m-0 ${large ? "text-sm" : "text-[11px]"} ${
            status === "done"
              ? "text-brand-greenBright"
              : status === "error"
                ? "text-red-400"
                : ""
          }`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
