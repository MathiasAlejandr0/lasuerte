"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatClp, type Pack } from "@/data/packs";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/store/cart";
import { PaymentBadges } from "./PaymentBadges";
import { Tilt3D } from "@/components/ui/Tilt3D";

const TRUST_ITEMS = [
  "Bases protocolizadas ante notario de Puerto Montt",
  "Pago 100% seguro con Webpay y Mercado Pago",
  "Premio garantizado y entregado por sorteo en vivo",
];

function TrustRibbon() {
  return (
    <div
      className="reveal reveal-delay-1 flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10"
      aria-label="Garantías"
    >
      {TRUST_ITEMS.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-brand-muted tracking-wide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="w-4 h-4 text-brand-greenBright shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3.28 7.72a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 1 1 1.06-1.06l.97.97 2.97-2.97a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          {item}
        </span>
      ))}
    </div>
  );
}

export function Packs() {
  const addPack = useCart((s) => s.addPack);
  const router = useRouter();
  const { packs } = useCatalog();
  const [lightbox, setLightbox] = useState<Pack | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const handleBuy = (pack: Pack) => {
    if (buyingId) return;
    addPack(pack.id, 1);
    setBuyingId(pack.id);
    window.setTimeout(() => router.push("/checkout"), 700);
  };

  return (
    <section id="comprar" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-6">
          <h2 className="reveal display-title text-4xl md:text-6xl font-black font-title text-white">
            Adquiere tus{" "}
            <span className="text-brand-gold">Packs de Ilustración</span>
          </h2>
          <p className="reveal reveal-delay-1 text-brand-muted max-w-xl mx-auto text-sm md:text-base">
            Elige uno de nuestros 3 paquetes oficiales. Con cada pack recibirás
            espectaculares ilustraciones digitales de paisajes del sur de Chile
            y números de regalo para participar:
          </p>
        </div>

        <TrustRibbon />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {packs.map((pack, i) => {
            const isBuying = buyingId === pack.id;
            const orderCls =
              pack.order === 1
                ? "md:order-1"
                : pack.order === 2
                  ? "md:order-2"
                  : "md:order-3";
            return (
              <div
                key={pack.id}
                className={`group pack-card glass-card flex flex-col justify-between p-8 rounded-3xl text-center cursor-pointer relative ${orderCls} ${
                  i === 0 ? "reveal" : `reveal reveal-delay-${i}`
                } ${pack.featured ? "gradient-border" : ""}`}
              >
                {pack.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-greenBright text-black py-1 px-4 rounded-full text-[11px] font-extrabold uppercase tracking-wider z-20 opacity-95">
                    MÁS CONVENIENTE
                  </div>
                )}

                <div className="mb-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setLightbox(pack)}
                    aria-label={`Ver ${pack.name} en grande`}
                    className="animate-float-slow w-full cursor-zoom-in"
                  >
                    <Tilt3D className="w-full rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-brand-bgLight">
                      <Image
                        src={pack.image}
                        alt={pack.name}
                        width={1000}
                        height={1333}
                        className="w-full h-auto"
                        priority={i === 0}
                      />
                    </Tilt3D>
                  </button>
                </div>

                <h3 className="text-2xl font-black text-white">{pack.name}</h3>
                <p className="text-sm text-brand-muted mt-2">
                  +{pack.ticketCount} Número
                  {pack.ticketCount > 1 ? "s" : ""} de Sorteo Gratis
                </p>
                <p className="text-white font-extrabold text-4xl mt-5">
                  {formatClp(pack.priceClp)}{" "}
                  <span className="text-sm text-brand-cream/60">CLP</span>
                </p>

                <button
                  type="button"
                  disabled={isBuying}
                  onClick={() => handleBuy(pack)}
                  aria-live="polite"
                  className={`btn-buy mt-6 w-full py-3 rounded-full text-sm font-bold transition-all cursor-pointer block text-center bg-white/5 text-brand-gold border border-white/15 group-hover:bg-brand-greenBright group-hover:text-black group-hover:border-brand-greenBright group-hover:shadow-[0_12px_32px_rgba(54,240,115,0.35)] ${
                    isBuying
                      ? "!bg-brand-greenBright !text-black !border-brand-greenBright cursor-default"
                      : ""
                  }`}
                >
                  {isBuying ? (
                    <span className="inline-flex items-center justify-center gap-2 check-pop">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3.28 7.72a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 1 1 1.06-1.06l.97.97 2.97-2.97a.75.75 0 0 1 1.06 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      ¡Listo! Tus números van al carrito
                    </span>
                  ) : (
                    "Participar"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <PaymentBadges />
      </div>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.name}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Cerrar"
              className="absolute -top-12 right-0 sm:-right-2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white hover:bg-brand-greenBright hover:text-black transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src={lightbox.image}
              alt={lightbox.name}
              width={1000}
              height={1333}
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
            <p className="text-center text-white mt-3 text-sm font-semibold">
              {lightbox.name} · {formatClp(lightbox.priceClp)} CLP
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
