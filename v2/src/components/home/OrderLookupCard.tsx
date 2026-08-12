"use client";

import Image from "next/image";
import { useId, useState } from "react";

const faqs = [
  {
    q: "¿Cómo sé cuáles son mis códigos?",
    a: "Tras el pago recibirás tus ilustraciones y códigos por correo. También puedes consultarlos aquí con el email de la compra.",
  },
  {
    q: "¿Es legal este sorteo en Chile?",
    a: "Sí. Vendemos productos digitales y, de forma promocional, regalamos boletos de participación. Las bases están protocolizadas ante notario.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Débito, crédito y cuenta RUT vía Mercado Pago y Webpay.",
  },
];

type Ticket = {
  code: string;
  number: number;
  orderId: string;
};

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function whatsappHref() {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") || "";
  const text = encodeURIComponent(
    "Hola, quiero consultar sobre mi pedido / códigos de participación.",
  );
  if (raw) return `https://wa.me/${raw}?text=${text}`;
  return `https://wa.me/?text=${text}`;
}

export function OrderLookupCard() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [faqOpen, setFaqOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setStatus("loading");
    setMessage("");
    setTickets(null);
    try {
      const res = await fetch("/api/tickets/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await res.json()) as {
        tickets?: Ticket[];
        error?: string;
      };
      if (res.ok && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
        setStatus("done");
        setMessage(
          data.tickets.length > 0
            ? `Encontramos ${data.tickets.length} código${
                data.tickets.length > 1 ? "s" : ""
              }.`
            : "No encontramos códigos con ese correo todavía.",
        );
      } else {
        setStatus("error");
        setMessage(data.error || "No pudimos consultar. Intenta más tarde.");
      }
    } catch {
      setStatus("error");
      setMessage("No pudimos consultar. Intenta más tarde.");
    }
  };

  return (
    <article className="order-lookup-card w-full max-w-[380px] mx-auto rounded-3xl overflow-hidden bg-white text-neutral-900 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
      <header className="flex items-center gap-3 bg-black px-4 py-3.5 text-white">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/15">
          <Image
            src="/images/packs/chiloe.webp"
            alt=""
            fill
            className="object-cover"
            sizes="44px"
          />
        </div>
        <div className="min-w-0 leading-tight">
          <h2 className="m-0 text-[17px] font-extrabold tracking-tight">
            Consulta tu pedido
          </h2>
          <p className="m-0 mt-0.5 text-[12px] font-medium text-white/70">
            Revisa aquí tus tickets con tu email
          </p>
        </div>
      </header>

      <div className="space-y-3 bg-white px-4 py-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <label
            htmlFor={emailId}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-800"
          >
            <MailIcon className="size-3.5 text-neutral-700" />
            Email de tu compra
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3 text-[14px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-[14px] font-extrabold uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60"
          >
            <SearchIcon className="size-4" />
            {status === "loading" ? "Buscando…" : "Buscar"}
          </button>
        </form>

        {message ? (
          <p
            className={`m-0 text-[13px] leading-snug ${
              status === "error" ? "text-red-600" : "text-neutral-700"
            }`}
            role={status === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        ) : null}

        {tickets && tickets.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-neutral-100 p-3">
            {tickets.map((t) => (
              <span
                key={`${t.orderId}-${t.code || t.number}`}
                className="rounded-lg bg-black px-2.5 py-1.5 text-[12px] font-bold tracking-wide text-white"
              >
                {t.code || String(t.number).padStart(5, "0")}
              </span>
            ))}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl bg-neutral-100">
          <button
            type="button"
            onClick={() => setFaqOpen((o) => !o)}
            aria-expanded={faqOpen}
            className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3.5 py-3 text-left text-[13px] font-semibold text-neutral-800"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-[12px] font-bold text-neutral-800">
              ?
            </span>
            <span className="flex-1">Preguntas frecuentes</span>
            <svg
              className={`size-4 text-neutral-500 transition-transform duration-300 ${
                faqOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              faqOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <ul className="m-0 space-y-3 border-t border-neutral-200 px-3.5 pb-3.5 pt-3">
                {faqs.map((faq) => (
                  <li key={faq.q} className="list-none">
                    <p className="m-0 text-[12px] font-bold text-neutral-900">
                      {faq.q}
                    </p>
                    <p className="m-0 mt-1 text-[12px] leading-relaxed text-neutral-600">
                      {faq.a}
                    </p>
                  </li>
                ))}
                <li className="list-none pt-1">
                  <a
                    href="#faq"
                    className="text-[12px] font-semibold text-neutral-800 underline underline-offset-2"
                  >
                    Ver todas las preguntas
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-[14px] font-bold text-white no-underline transition hover:brightness-105"
        >
          <WhatsAppIcon className="size-5" />
          Contáctanos por WhatsApp
        </a>
      </div>
    </article>
  );
}
