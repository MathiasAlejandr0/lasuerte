"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿Cómo sé cuáles son mis números asignados?",
    a: "Una vez finalizado el pago (Mercado Pago o Webpay), recibirás tus ilustraciones digitales de regalo directamente en tu correo. El sistema asignará automáticamente tus números de sorteo y te enviará el comprobante de inmediato por correo. También podrás consultarlos al final de la página en CONSULTAR NÚMEROS, ingresando con el correo usado en la compra.",
  },
  {
    q: "¿Es legal este sorteo en Chile?",
    a: "Sí. Comercializamos productos digitales (ilustraciones fotográficas de la Patagonia). De forma promocional y completamente legal, regalamos boletos de participación para el sorteo, cuyas bases están protocolizadas ante notario en Puerto Montt.",
  },
  {
    q: "¿Qué incluye la MOTORRAD CORSA R150 2026?",
    a: "Se entrega la motocicleta año 2026, con toda su documentación al día, transferida completamente a tu nombre, pagada por el equipo de SUERTU2S.",
  },
  {
    q: "¿Cuáles son los medios de pago disponibles?",
    a: "Aceptamos tarjetas de débito (Redcompra), cuenta RUT y tarjetas de crédito de cualquier banco nacional mediante la pasarela segura e integrada de Mercado Pago y Webpay.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black font-title text-center text-white mb-10">
          Preguntas Frecuentes
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className={`faq-item bg-brand-bg border border-brand-gold/20 rounded-xl overflow-hidden ${
                open === i ? "open" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer group bg-transparent border-none"
              >
                <span className="text-base font-bold text-brand-cream group-hover:text-brand-gold transition-colors">
                  {faq.q}
                </span>
                <svg
                  className="faq-icon w-5 h-5 text-brand-gold transition-transform duration-300 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="faq-content">
                <div className="px-5 pb-5 text-sm text-brand-muted leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
