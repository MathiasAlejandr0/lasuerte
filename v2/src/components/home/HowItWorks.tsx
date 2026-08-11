"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    n: 1,
    title: "Adquiere tu Ilustración",
    body: "Selecciona tu Pack de Ilustraciones digitales (1, 2 o 3 imágenes) con increíbles paisajes del sur de Chile.",
  },
  {
    n: 2,
    title: "Inscripción y Pago Seguro",
    body: "Llena tus datos para vincular tu nombre a los códigos de participación incluidos. El pago es inmediato y seguro a través de Mercado Pago.",
  },
  {
    n: 3,
    title: "¡Gánate la Moto!",
    body: "Tus códigos de participación e ilustraciones te llegan de inmediato por correo. El sorteo se transmitirá en vivo ante ministro de fe.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cards = root.querySelectorAll(".step-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2 },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="como-jugar"
      className="py-16 px-4 max-w-6xl mx-auto text-center"
      ref={ref}
    >
      <span className="reveal text-xs uppercase tracking-widest text-brand-greenBright font-bold block mb-2">
        Explicado paso a paso
      </span>
      <h2 className="reveal reveal-delay-1 display-title text-4xl md:text-6xl font-black font-title text-white mb-12">
        Es súper rápido y fácil participar
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div
            key={step.n}
            className="step-card glass-card p-8 rounded-3xl relative space-y-4"
          >
            <div className="step-number absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-brand-green to-brand-greenBright text-black font-black text-lg flex items-center justify-center border-2 border-brand-gold shadow-md">
              {step.n}
            </div>
            <h3 className="text-xl font-bold text-white mt-4">{step.title}</h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
